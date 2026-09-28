import { readFile } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../themes/', import.meta.url));
const layout = { page_x: '96px', page_top: '64px', page_bottom: '56px', body_size: '22px', body_leading: '1.7', title_size: '36px', block_gap: '18px', section_gap: '30px' };
export const starterTheme = { extends: 'nju', name: 'My NJU', primary: '#6f145f', accent: '#3159a6' };

export async function loadTheme(label = 'nju') {
  const defaults = { ...JSON.parse(await readFile(resolve(root, 'nju.json'), 'utf8')), ...layout };
  let custom = {}, customRoot = root;
  if (label.toLowerCase() !== 'nju') {
    if (extname(label).toLowerCase() !== '.json') throw new Error(`未知主题：${label}；使用 nju 或 JSON 文件。`);
    const path = resolve(label);
    customRoot = dirname(path);
    custom = JSON.parse((await readFile(path, 'utf8')).replace(/^\uFEFF/, ''));
    if (!custom || Array.isArray(custom) || typeof custom !== 'object') throw new Error('主题必须是 JSON 对象。');
    if ((custom.extends ?? 'nju') !== 'nju') throw new Error('主题 extends 目前只支持 nju。');
    for (const key of Object.keys(custom)) if (key !== 'extends' && !(key in defaults)) throw new Error(`未知主题字段：${key}`);
  }
  const values = { ...defaults, ...custom };
  if (values.layout !== 'academic') throw new Error('仅支持 academic 单页版式。');
  function token(key, seen = []) {
    if (!(key in values)) throw new Error(`未知主题引用：$${key}`);
    if (seen.includes(key)) throw new Error(`循环主题引用：${key}`);
    const value = values[key];
    if (typeof value === 'string' && value.startsWith('$')) return token(value.slice(1), [...seen, key]);
    return value;
  }
  const css = Object.keys(defaults).filter(k => !['name', 'layout', 'brand_logo', 'brand_label'].includes(k)).map(key => {
    const value = token(key);
    if (typeof value !== 'string' || !value.trim() || /[;{}<>\r\n]|url\s*\(|\/\*/i.test(value)) throw new Error(`无效主题值：${key}`);
    return `--folio-${key.replaceAll('_', '-')}:${value}`;
  }).join(';');
  let logo = '';
  if (values.brand_logo !== null) {
    if (typeof values.brand_logo !== 'string') throw new Error('brand_logo 必须是本地图片路径或 null。');
    const path = resolve(Object.hasOwn(custom, 'brand_logo') ? customRoot : root, values.brand_logo);
    const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' }[extname(path).toLowerCase()];
    if (!mime) throw new Error('不支持的主题标志图片类型。');
    logo = `data:${mime};base64,${(await readFile(path)).toString('base64')}`;
  }
  return { css, logo, label: String(values.brand_label) };
}
