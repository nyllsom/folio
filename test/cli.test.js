import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { stripVTControlCharacters } from 'node:util';
import { formatHelp } from '../src/help.js';

const cli = fileURLToPath(new URL('../src/cli.js', import.meta.url));
const run = args => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
test('topic help and unknown commands return useful status codes', () => {
  for (const topic of ['bind', 'theme', 'example', 'agent']) {
    const result = run(['help', topic]);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /folio/);
  }
  assert.equal(run(['unknown']).status, 1);
  assert.equal(run(['bind']).status, 1);
});
test('help color preserves text and respects terminal and environment settings', () => {
  const plainEnv = { ...process.env };
  delete plainEnv.NO_COLOR;
  delete plainEnv.FORCE_COLOR;
  const invoke = env => spawnSync(process.execPath, [cli, 'help', 'bind'], {
    encoding: 'utf8', env: { ...plainEnv, ...env }
  });
  const plain = invoke({});
  const colored = invoke({ FORCE_COLOR: '1' });
  assert.equal(plain.status, 0);
  assert.equal(colored.status, 0);
  assert.doesNotMatch(plain.stdout, /\x1b\[/);
  assert.match(colored.stdout, /\x1b\[/);
  assert.equal(stripVTControlCharacters(colored.stdout), plain.stdout);
  assert.equal(invoke({ NO_COLOR: '1', FORCE_COLOR: '1' }).stdout, plain.stdout);
  const text = 'FOLIO — help\nfolio bind pages.md [-o out.html]';
  const stream = { isTTY: true };
  assert.match(formatHelp(text, { stream, env: {} }), /\x1b\[/);
  for (const env of [{ TERM: 'dumb' }, { FORCE_COLOR: '0' }, { NO_COLOR: '' }]) {
    assert.equal(formatHelp(text, { stream, env }), text);
  }
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
