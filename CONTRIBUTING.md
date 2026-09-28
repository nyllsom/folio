# 修改 FOLIO

整理讲义从 [范例](examples/README.md) 开始。本文介绍代码与开发流程。

## 代码在哪里

| 想改什么 | 位置 |
| --- | --- |
| 命令与帮助 | `src/cli.js`、`src/help.js` |
| Markdown 分页、图片嵌入、HTML 输出 | `src/compiler.js` |
| 主题读取、继承与校验 | `src/theme.js`、`themes/` |
| 字体、间距与响应式布局 | `src/paper.css` |
| 翻页、缩放、图片放大 | `src/player.js` |
| 可复制范例与用法文档 | `examples/` |
| 编译器与 CLI 测试 | `test/` |

编译器只依赖 `markdown-it`。生成的 HTML 不需要运行时依赖或服务器。课程资料放在各自的内容目录，工具仓库只保存代码与通用范例。

## 本地开发

```bash
npm ci
npm test
npm run examples:build
node src/cli.js bind examples/quickstart/pages.md
```

修改主题或播放器后，重新生成范例预览，用浏览器检查桌面与窄屏阅读、长页滚动、键盘翻页和图片放大。预览与源码一起提交，安装后即可打开。

## 分发

```bash
npm pack
```

包中包含代码、主题、范例与文档，不包含测试临时文件或课程内容。发布改动前，在仓库外安装打包文件，验证 `folio help`、范例复制和实际编译。项目通过 Git 分发，无需先发布到 npm registry：

```bash
npm install -g git+https://github.com/nyllsom/folio.git && folio help
```
