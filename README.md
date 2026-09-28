# FOLIO

**From slides to readable pages.**

FOLIO 把演示材料整理成可逐页阅读的图文讲义。让要点有解释，让图片有上下文，让读者可以按自己的节奏理解内容。

用 Markdown 编排正文与插图，运行 `folio bind`，生成可离线打开、直接分享的 HTML。默认采用 NJU 主题，支持自定义配色、字体和版式参数。

安装并查看用法：

```bash
npm install -g git+https://github.com/nyllsom/folio.git && folio help
```

从一个范例开始：

```bash
folio example --copy my-pages
folio bind my-pages/pages.md
```

打开生成的 `pages.html`。左右键翻页，滚轮阅读长页，点击插图放大。

- **学习使用**：[从范例开始](examples/README.md) · [写法与主题速查](examples/reference.md)
- **命令行帮助**：`folio help bind` · `folio help theme`
- **参与开发**：[开发说明](CONTRIBUTING.md)

安装需要 Node.js 20+ 和 Git。当前版本接收整理后的 Markdown 与本地图片；原始 slides 的内容梳理与配图提取在编译前完成。

采用 [MIT 许可](LICENSE)。
