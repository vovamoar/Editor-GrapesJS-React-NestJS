import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common'
import { Response } from 'express'
import * as fs from 'fs-extra'
import * as path from 'path'
import { SitesService } from './sites.service'

@Controller('api')
export class SitesController {
  constructor(private readonly sitesService: SitesService) { }

  @Get('sites')
  async getSites() {
    try {
      return await this.sitesService.getSiteList()
    } catch {
      throw new HttpException(
        'Failed to get sites',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get('preview/:site')
  async getPreview(@Param('site') site: string, @Res() res: Response) {
    try {
      const sitePath = path.join(__dirname, '../../sites', site)
      const htmlPath = path.join(sitePath, 'index.html')
      let html = await fs.readFile(htmlPath, 'utf-8')

      html = html.replace(/src="(\.\/)?images\//g, `src="/static/${site}/images/`)
      html = html.replace(/src="(\.\/)?js\//g, `src="/static/${site}/js/`)
      html = html.replace(/href="(\.\/)?css\//g, `href="/static/${site}/css/`)

      const extraStyles = [
        'styles.css',
        'bootstrap.min.css',
        'materialize.min.css',
        'tailwind.min.css',
        'bulma.min.css',
        'all.min.css',
      ]

      for (const file of extraStyles) {
        const filePath = path.join(sitePath, 'css', file)
        if (await fs.pathExists(filePath)) {
          html = html.replace(
            '</head>',
            `<link rel="stylesheet" href="/static/${site}/css/${file}"></head>`,
          )
        }
      }

      const jsPath = path.join(sitePath, 'js', 'index.js')
      if (await fs.pathExists(jsPath)) {
        html = html.replace(
          '</body>',
          `<script src="/static/${site}/js/index.js"></script></body>`,
        )
      }

      res.type('html').send(html)
    } catch (error) {
      console.error('Preview error:', error)
      throw new HttpException(
        'Failed to load preview',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get('edit/:site')
  async getEdit(@Param('site') site: string) {
    try {
      return await this.sitesService.getHtmlCss(site)
    } catch {
      throw new HttpException(
        'Failed to get edit data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Post('save/:site')
  async save(
    @Param('site') site: string,
    @Body() body: { html: string; css: string },
  ) {
    try {
      await this.sitesService.saveSite(site, body.html, body.css)
      return { success: true }
    } catch {
      throw new HttpException('Save failed', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get('editor/:site')
  async getEditorHtml(@Param('site') site: string, @Res() res: Response) {
    try {
      const sitePath = path.join(__dirname, '../../sites', site)
      const { html, css } = await this.sitesService.getHtmlCss(site)

      const cleanedHtml = html
        .replace(/src="(\.\/)?images\//g, `src="/static/${site}/images/`)
        .replace(/src="\/images\//g, `src="/static/${site}/images/`)
        .replace(
          /src="data:image\/[^"]+"/g,
          `src="/static/${site}/images/logo.webp"`,
        )

      const cssDir = path.join(sitePath, 'css')
      let stylesLinks = ''

      if (await fs.pathExists(cssDir)) {
        const files = await fs.readdir(cssDir)
        for (const file of files) {
          if (file.endsWith('.css')) {
            stylesLinks += `<link rel="stylesheet" href="/static/${site}/css/${file}">\n`
          }
        }
      }

      const safeHtml = JSON.stringify(cleanedHtml).replace(
        /<\/script>/g,
        '<\\/script>',
      )

      const editorHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Editor - ${site}</title>
          <link href="https://unpkg.com/grapesjs/dist/css/grapes.min.css" rel="stylesheet"/>
          ${stylesLinks}
          <style>body, html { margin: 0; height: 100%; }</style>
        </head>
        <body>
          <button onclick="saveProject()" style="position:fixed;top:10px;left:10px;z-index:1000;">💾 Зберегти</button>
          <div id="gjs" style="height: 100vh;"></div>

          <script src="https://unpkg.com/grapesjs"></script>
          <script src="https://unpkg.com/grapesjs-blocks-basic"></script>

          <script>
            const editor = grapesjs.init({
              container: '#gjs',
              fromElement: false,
              components: ${safeHtml},
              style: \`${css}\`,
              height: '100%',
              width: 'auto',
              plugins: ['gjs-blocks-basic'],
              pluginsOpts: {
                'gjs-blocks-basic': {
                  flexGrid: true,
                  blocks: [
                    'column1', 'column2', 'column3', 'text', 'link',
                    'image', 'video', 'map', 'quote', 'button',
                    'section', 'list-items', 'grid-items', 'text-basic'
                  ],
                },
              },
              storageManager: { type: null },
              assetManager: {
                embedAsBase64: false,
                upload: false,
                assets: [
                  '/static/${site}/images/logo.webp',
                  '/static/${site}/images/windows.png',
                  '/static/${site}/images/decore.webp'
                ]
              }
            });

            function saveProject() {
              const html = editor.getHtml();
              const css = editor.getCss();

              fetch('http://localhost:5001/api/save/${site}', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html, css })
              })
              .then(() => {
                alert('✅ Збережено!');
                window.open('http://localhost:5001/api/preview/${site}?v=' + Date.now(), '_blank');
              })
              .catch(() => alert('❌ Помилка збереження'));
            }
          </script>
        </body>
        </html>
      `

      res.type('html').send(editorHtml)
    } catch (e) {
      console.error('Editor error:', e)
      throw new HttpException(
        'Failed to load editor',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
