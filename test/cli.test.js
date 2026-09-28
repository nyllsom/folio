import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const cli = fileURLToPath(new URL('../src/cli.js', import.meta.url));
const run = args => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
test('topic help and unknown commands return useful status codes', () => {
  for (const topic of ['bind', 'theme', 'example']) {
    const result = run(['help', topic]);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /folio/);
  }
  assert.equal(run(['unknown']).status, 1);
  assert.equal(run(['bind']).status, 1);
});
test('copied example can be bound independently and cannot be overwritten', async () => {
  const root = await mkdtemp(join(tmpdir(), 'folio-example-'));
  try {
    const target = join(root, 'my-pages');
    assert.equal(run(['example', '--copy', target]).status, 0);
    assert.equal(run(['example', '--copy', target]).status, 1);
    const output = join(root, 'output', 'book.html');
    const result = run(['bind', join(target, 'pages.md'), '--theme', join(target, 'theme.json'), '-o', output]);
    assert.equal(result.status, 0, result.stderr);
    const html = await readFile(output, 'utf8');
    assert.equal((html.match(/class="page"/g) ?? []).length, 2);
    assert.match(html, /data:image\/svg\+xml;base64,/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
