import katex from 'katex';
import texmath from 'markdown-it-texmath';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const dist = dirname(require.resolve('katex'));
let assets;

export function math(md) {
  md.use(texmath, { engine: katex, delimiters: ['dollars', 'brackets'] });
  // Report invalid TeX at build time instead of leaving broken formulas in the page.
  for (const name of Object.keys(md.renderer.rules).filter(name => name.startsWith('math_'))) {
    md.renderer.rules[name] = (tokens, index) => {
      const token = tokens[index];
      const displayMode = token.block || name.includes('double');
      const html = katex.renderToString(token.content, {
        displayMode, throwOnError: true, trust: false, maxExpand: 1000
      });
      return displayMode ? `<div class="math-display">${html}</div>\n` : html;
    };
  }
}

export function mathAssets() {
  return assets ??= (async () => {
    let css = await readFile(resolve(dist, 'katex.min.css'), 'utf8');
    // Keep one modern font format, with no network or relative-file dependencies.
    css = css.replace(/src:[^;}]+/g, src => {
      const font = src.match(/url\(([^)]+\.woff2)\)\s*format\(["']?woff2["']?\)/);
      if (!font) throw new Error('KaTeX 字体资源格式不受支持。');
      return `src:url(${font[1]}) format("woff2")`;
    });
    for (const path of new Set([...css.matchAll(/url\(([^)]+)\)/g)].map(match => match[1]))) {
      const bytes = await readFile(resolve(dist, path));
      css = css.replaceAll(`url(${path})`, `url(data:font/woff2;base64,${bytes.toString('base64')})`);
    }
    const license = await readFile(resolve(dist, '../LICENSE'), 'utf8');
    return `/* KaTeX\n${license.replaceAll('*/', '* /')}\n*/\n${css}`;
  })();
}
