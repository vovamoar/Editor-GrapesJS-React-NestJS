import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';

const SITES_DIR = path.join(__dirname, '../../sites-storage');

@Injectable()
export class SitesService {
  async getSiteList() {
    return await fs.readdir(SITES_DIR);
  }

  async getHtml(site: string, forPreview = false) {
    const filePath = path.join(SITES_DIR, site, 'index.html');
    let html = await fs.readFile(filePath, 'utf8');
    if (forPreview) {
      html = html.replace(/src="images\//g, `src="/static/${site}/images/`);
    }
    return html;
  }

  async getHtmlCss(site: string) {
    const html = await fs.readFile(
      path.join(SITES_DIR, site, 'index.html'),
      'utf8',
    );
    const css = await fs.readFile(
      path.join(SITES_DIR, site, 'css/styles.css'),
      'utf8',
    );
    return { html, css };
  }

  async saveSite(site: string, html: string, css: string) {
    const htmlPath = path.join(SITES_DIR, site, 'index.html');
    const cssPath = path.join(SITES_DIR, site, 'css/styles.css');
    await fs.writeFile(htmlPath, html, 'utf8');
    await fs.writeFile(cssPath, css, 'utf8');
  }
}
