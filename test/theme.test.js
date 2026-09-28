import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { compile } from '../src/compiler.js';

test('NJU defaults and logo are embedded, custom references inherit and override', async () => {
  const html = await compile('## NJU\n\n正文');
  assert.match(html, /--folio-primary:#6f145f/);
  assert.match(html, /--folio-stage:#eee9ed/);
  assert.match(html, /class="brand-logo" src="data:image\/png;base64,/);
  const dir = await mkdtemp(join(tmpdir(), 'folio-theme-'));
  try {
    const theme = join(dir, 'custom.json');
    await writeFile(theme, JSON.stringify({ primary: '#123456', accent: '$primary', brand_logo: null, body_size: '26px' }));
    const custom = await compile('## Custom', { theme });
    assert.match(custom, /--folio-accent:#123456/);
    assert.match(custom, /--folio-body-size:26px/);
    assert.doesNotMatch(custom, /class="brand-logo"/);
    await writeFile(theme, JSON.stringify({ primary: '$accent', accent: '$primary' }));
    await assert.rejects(compile('## Page', { theme }), /循环/);
    await writeFile(theme, JSON.stringify({ primary: '</style><script>alert(1)</script>' }));
    await assert.rejects(compile('## Page', { theme }), /无效主题值/);
    await writeFile(theme, JSON.stringify({ primry: '#123456' }));
    await assert.rejects(compile('## Page', { theme }), /未知主题字段/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('theme init creates an editable config and never overwrites one', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'folio-theme-init-'));
  try {
    const cli = fileURLToPath(new URL('../src/cli.js', import.meta.url));
    const args = [cli, 'theme', 'init', '-o', join(dir, 'theme.json')];
    assert.equal(spawnSync(process.execPath, args).status, 0);
    assert.equal(spawnSync(process.execPath, args).status, 1);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
