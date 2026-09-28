import MarkdownIt from 'markdown-it';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { loadTheme } from './theme.js';

const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' };
const md = new MarkdownIt({ html: false, typographer: true });

// Split parsed top-level headings, so headings inside code/quotes never become slides.
function sections(tokens) {
  const pages = [];
  let title = '讲义';
  let foundTitle = false;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'heading_open' && t.level === 0 && t.tag === 'h1') {
      if (pages.length || foundTitle) throw new Error('# 文档标题只能在开头出现一次。');
      title = tokens[i + 1].content;
      foundTitle = true;
      i += 2;
    } else if (t.type === 'heading_open' && t.level === 0 && t.tag === 'h2') {
      pages.push({ title: tokens[i + 1].content, tokens: [] });
      i += 2;
    } else if (pages.length) {
      pages.at(-1).tokens.push(t);
    } else if (t.type !== 'html_block') {
      throw new Error('正文必须放在 ## 页面标题之后。');
    }
  }
  if (!pages.length) throw new Error('至少需要一个 ## 页面标题。');
  return { title, pages };
}

async function embedImages(tokens, baseDir) {
  for (const t of tokens) {
    if (t.type === 'image') {
      const src = t.attrGet('src');
      if (/^(?:[a-z][\w+.-]*:|\/\/)/i.test(src)) throw new Error(`图片必须是本地文件：${src}`);
      const file = resolve(baseDir, decodeURIComponent(src));
      const type = mime[extname(file).toLowerCase()];
      if (!type) throw new Error(`不支持的图片类型：${src}`);
      let bytes;
      try { bytes = await readFile(file); } catch { throw new Error(`找不到图片：${src}`); }
      t.attrSet('src', `data:${type};base64,${bytes.toString('base64')}`);
    }
    if (t.children) await embedImages(t.children, baseDir);
  }
}

function renderBlocks(tokens) {
  let html = '';
  for (let i = 0; i < tokens.length; i++) {
    const inline = tokens[i + 1];
    const children = inline?.children?.filter(t => t.type !== 'text' || t.content.trim());
    if (tokens[i].type === 'paragraph_open' && children?.length === 1 && children[0].type === 'image') {
      const img = children[0];
      const caption = img.attrGet('title');
      html += `<figure>${md.renderer.render([inline], md.options, {})}${caption ? `<figcaption>${escape(caption)}</figcaption>` : ''}</figure>`;
      i += 2;
    } else html += md.renderer.render([tokens[i]], md.options, {});
  }
  return html;
}

export async function compile(source, { baseDir = process.cwd(), theme = 'nju' } = {}) {
  const appearance = await loadTheme(theme);
  const { title, pages } = sections(md.parse(source.replace(/^\uFEFF/, ''), {}));
  await Promise.all(pages.map(p => embedImages(p.tokens, baseDir)));
  const [css, js] = await Promise.all([
    readFile(new URL('./paper.css', import.meta.url), 'utf8'),
    readFile(new URL('./player.js', import.meta.url), 'utf8')
  ]);
  const body = pages.map((p, i) => `<section class="page" id="page-${i + 1}" aria-labelledby="title-${i + 1}" tabindex="-1"${i ? ' hidden' : ''}>
    <header><h2 id="title-${i + 1}">${md.renderInline(p.title)}</h2>${appearance.logo ? `<img class="brand-logo" src="${appearance.logo}" alt="${escape(appearance.label)}">` : ''}</header>
    <article>${renderBlocks(p.tokens)}</article>
  </section>`).join('\n');
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>${escape(title)}</title>
<style>:root{${appearance.css}}\n${css}</style></head>
<body><main aria-label="${escape(title)}">${body}</main>
<dialog aria-label="放大查看图片"><button aria-label="关闭图片">×</button><img alt=""><p></p></dialog>
<script>${js}</script></body></html>`;
}
