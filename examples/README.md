# 从范例开始

先把演示稿里的提纲展开成可独立阅读的解释，再把原图放到对应段落旁。FOLIO 负责把这些内容编排成可以翻阅的页面。

## 1. 安装

需要 Node.js 20+ 和 Git：

```bash
npm install -g git+https://github.com/nyllsom/folio.git && folio help
```

也可以在已有项目中安装：

```bash
npm install git+https://github.com/nyllsom/folio.git
npx folio help
```

## 2. 复制一个范例

```bash
folio example --copy my-pages
cd my-pages
folio bind pages.md
```

打开 `pages.html`。范例有两页，展示段落、标题、插图和图注。单独运行 `folio example` 可以查看随包预览的位置；复制不会覆盖已有目录。

| 文件 | 用途 |
| --- | --- |
| [pages.md](quickstart/pages.md) | 写正文与组织页面 |
| [figure.svg](quickstart/figure.svg) | 插图，可替换为自己的图片 |
| [theme.json](quickstart/theme.json) | 可选的自定义主题 |
| [pages.html](quickstart/pages.html) | 可离线打开的阅读版本 |

## 3. 从 slides 整理内容

以章节提纲划分主题，每个主题写成一个 `##` 页面，用 `###` 组织页内内容。把演示时需要口头补充的因果关系、例子和术语解释写进段落；保留有助于理解的原图，并在图注说明来源。页数由阅读主题决定，不必与原幻灯片一一对应。

`#` 设置整份讲义的标题，不额外生成封面。图片路径相对稿件文件。独立成段的图片会出现在正文旁，窄屏时改为上下排列。长页可以滚动，插图可以放大。

## 4. 编译与分享

```bash
folio bind pages.md
folio bind pages.md -o output/reading.html
folio bind pages.md --theme theme.json
```

默认在稿件旁生成同名 HTML。使用 `-o` 可以指定位置，父目录会自动创建，已有输出会被覆盖。生成文件已包含图片、样式与播放器，发送这一个文件即可；收件人无需安装 FOLIO。字体使用本机可用字体，正文中的外部链接仍指向原网站。

## 5. 调整主题

```bash
folio theme init -o my-theme.json
folio bind pages.md --theme my-theme.json
```

默认主题是 `nju`。配置只需写要覆盖的字段，例如修改 `primary` 主色、`body_size` 字号，或把 `brand_logo` 设为 `null` 隐藏校标。完整写法见 [速查](reference.md)。
