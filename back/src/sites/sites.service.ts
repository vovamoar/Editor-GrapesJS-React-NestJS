import { Injectable } from '@nestjs/common'
import * as fs from 'fs-extra'
import * as path from 'path'

const SITES_DIR = path.join(__dirname, '../../sites')

@Injectable()
export class SitesService {
  async getSiteList() {
    return await fs.readdir(SITES_DIR)
  }

  async getHtml(site: string, forPreview = false) {
    const filePath = path.join(SITES_DIR, site, 'index.html')
    let html = await fs.readFile(filePath, 'utf8')
    if (forPreview) {
      html = html.replace(/src="(\.\/)?images\//g, `src="/static/${site}/images/`)
    }
    return html
  }

  async getHtmlCss(site: string) {
    const html = await fs.readFile(
      path.join(SITES_DIR, site, 'index.html'),
      'utf8',
    )

    const cssDir = path.join(SITES_DIR, site, 'css')
    let css = ''

    if (await fs.pathExists(cssDir)) {
      const extraStyles = [
        'styles.css',
        'bootstrap.min.css',
        'materialize.min.css',
        'tailwind.min.css',
        'bulma.min.css',
        'all.min.css',
      ]

      for (const file of extraStyles) {
        const filePath = path.join(cssDir, file)
        if (await fs.pathExists(filePath)) {
          const fileContent = await fs.readFile(filePath, 'utf8')
          css += `/* ${file} */\n${fileContent}\n\n`
        }
      }
    }

    return { html, css }
  }

  async saveSite(site: string, html: string, css: string) {
    const htmlPath = path.join(SITES_DIR, site, 'index.html')
    const cssPath = path.join(SITES_DIR, site, 'css/styles.css')
    await fs.writeFile(htmlPath, html, 'utf8')
    await fs.writeFile(cssPath, css, 'utf8')
  }
}
