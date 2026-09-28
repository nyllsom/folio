#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve, dirname, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises';
import { compile } from './compiler.js';
import { starterTheme } from './theme.js';
import { help } from './help.js';

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      output: { type: 'string', short: 'o' }, theme: { type: 'string' },
      copy: { type: 'string' }, help: { type: 'boolean', short: 'h' }
    }
  });
  const [command, ...args] = positionals;
  if (values.help || !command || command === 'help') {
    const topic = command === 'help' ? args[0] : command;
    if (topic && !help[topic]) throw new Error(`未知帮助主题：${topic}`);
    console.log(help[topic ?? 'overview']);
  } else if (command === 'theme' && args.length === 1 && args[0] === 'init') {
    const path = resolve(values.output ?? 'theme.json');
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify(starterTheme, null, 2) + '\n', { flag: 'wx' });
    console.log(path);
  } else if (command === 'example' && args.length === 0) {
    const source = fileURLToPath(new URL('../examples/quickstart/', import.meta.url));
    if (values.copy) {
      const target = resolve(values.copy);
      await mkdir(target); // Refuse an existing destination before copying anything.
      for (const name of await readdir(source)) {
        await cp(resolve(source, name), resolve(target, name), { recursive: true, errorOnExist: true, force: false });
      }
      console.log(`范例已复制：${target}\n编译：folio bind "${resolve(target, 'pages.md')}"`);
    } else console.log(`打开范例：${resolve(source, 'pages.html')}\n复制源码：folio example --copy my-pages`);
  } else if (command === 'bind') {
    if (args.length !== 1) throw new Error('用法：folio bind <稿件.md> [-o 输出.html] [--theme nju|主题.json]');
    const input = resolve(args[0]);
    const output = resolve(values.output ?? resolve(dirname(input), parse(input).name + '.html'));
    if (input === output) throw new Error('输出不能覆盖 Markdown 源文件。');
    const html = await compile(await readFile(input, 'utf8'), { baseDir: dirname(input), theme: values.theme });
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, html);
    console.log(output);
  } else throw new Error(`未知命令：${positionals.join(' ')}。运行 folio help 查看用法。`);
} catch (error) {
  console.error(`folio: ${error.message}`);
  process.exitCode = 1;
}
