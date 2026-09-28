import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compile } from '../src/compiler.js';

test('only top-level H2 headings split pages; code and quotations survive', async () => {
  const html = await compile('# Title\n\n## One\n\n```md\n## Not a page\n```\n\n> ## Also not a page\n\n## Two\n\nText **bold**.');
  assert.equal((html.match(/class="page"/g) ?? []).length, 2);
  assert.match(html, /<code class="language-md">## Not a page/);
  assert.match(html, /<blockquote>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /id="page-2"[^>]*hidden/);
});

test('local assets are embedded relative to the manuscript and captions are escaped', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'folio-'));
  try {
    await writeFile(join(dir, '图.png'), Buffer.from('test-image'));
    const html = await compile('## Page\n\n![Alt](%E5%9B%BE.png "Figure <1>")', { baseDir: dir });
    assert.match(html, /src="data:image\/png;base64,dGVzdC1pbWFnZQ=="/);
    assert.match(html, /<figcaption>Figure &lt;1&gt;<\/figcaption>/);
    assert.match(html, /alt="Alt"/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('errors are explicit and arbitrary HTML is not executed', async () => {
  await assert.rejects(compile('# Title only'), /至少需要/);
  await assert.rejects(compile('orphan\n\n## Page'), /正文必须/);
  await assert.rejects(compile('## Page\n\n![](missing.png)'), /找不到图片/);
  await assert.rejects(compile('## Page\n\n![](https://example.com/a.png)'), /本地文件/);
  const html = await compile('## Page\n\n<script>alert(1)</script>');
  assert.match(html, /&lt;script&gt;alert/);
  assert.doesNotMatch(html, /<script>alert/);
});

test('copyright is optional, escaped, and rendered once outside the reading canvas', async () => {
  const html = await compile('<!-- folio:copyright © Author <script>x</script> -->\n# Book\n\n## One\nText\n\n## Two\nMore');
  assert.match(html, /<\/main>\s*<footer class="copyright">© Author &lt;script&gt;x&lt;\/script&gt;<\/footer>/);
  assert.equal((html.match(/<footer/g) ?? []).length, 1);
  assert.doesNotMatch(await compile('## Page\nText'), /<footer/);
});

test('TeX renders offline in paragraphs, blocks and tables while code stays literal', async () => {
  const html = await compile(String.raw`## Math

Inline $x_1$ and \(y^2\).

$$
\frac{L}{R}
$$

| Quantity | Value |
| --- | --- |
| Delay | $d/v$ |

\`$x$\`
`.replaceAll('\\`', '`'));
  assert.equal((html.match(/class="katex"/g) ?? []).length, 4);
  assert.match(html, /<math xmlns=/);
  assert.match(html, /class="math-display"/);
  assert.match(html, /data:font\/woff2;base64,/);
  assert.doesNotMatch(html, /url\(fonts\//);
  assert.match(html, /<code>\$x\$<\/code>/);
  assert.match(html, /class="table-scroll"/);
  const codeOnly = await compile('## Code\n\n```tex\n$x$\n```');
  assert.doesNotMatch(codeOnly, /data:font\/woff2|class="katex"/);
  await assert.rejects(compile('## Math\n\n$\\unknownCommand{x}$'), /Undefined control sequence/);
  const untrusted = await compile('## Math\n\n$\\href{javascript:alert(1)}{x}$');
  assert.doesNotMatch(untrusted, /href="javascript:/);
});

test('CLI writes to a separate directory and refuses to overwrite its input', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'folio-cli-'));
  const cli = fileURLToPath(new URL('../src/cli.js', import.meta.url));
  const source = join(dir, 'manuscript');
  const output = join(dir, 'build', 'deck.html');
  try {
    await writeFile(source, '# My notes\n\n## A page\n\nHello.');
    execFileSync(process.execPath, [cli, 'bind', source, '-o', output]);
    assert.match(await readFile(output, 'utf8'), /<title>My notes<\/title>/);
    execFileSync(process.execPath, [cli, 'bind', source]);
    assert.match(await readFile(source + '.html', 'utf8'), /Hello/);
    const result = spawnSync(process.execPath, [cli, 'bind', source, '-o', source], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /输出不能覆盖/);
    assert.match(await readFile(source, 'utf8'), /^# My notes/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
