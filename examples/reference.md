# 写法与主题速查

## 页面与正文

```md
# 文档标题

## 第一页标题

### 页内主题

![图片的替代文字](figure.png "图注与来源")

用段落解释内容，**粗体**强调关键结论。

## 第二页标题

继续写正文。
```

顶层 `##` 分页，代码块或引用里的标题不会分页。`#` 只能在开头出现一次。支持标准 Markdown 段落、强调、链接、列表、表格、引用与代码块；原始 HTML 会显示为文字。当前不解析 YAML 配置区、动画语法和 LaTeX 数学公式。

图片支持 PNG、JPEG、WebP、GIF 和 SVG，必须是本地文件，路径相对稿件。独立成段的图片使用图文布局，可选 title 作为图注；新的 `###` 从插图下方开始。图片会嵌入 HTML，缺失图片会导致编译报错。编译器会读取稿件引用的本地文件，因此应只编译可信稿件。

## 命令行

```bash
folio bind pages.md [-o output.html] [--theme nju|theme.json]
folio theme init [-o theme.json]
folio example [--copy new-directory]
folio help [bind|theme|example|agent]
```

稿件、输出及主题文件路径相对当前工作目录。默认输出为稿件旁的同名 `.html`。编译可以覆盖输出，但不能用输出路径覆盖源稿；主题生成与范例复制拒绝覆盖已有目标。命令出错时返回非零退出码。

帮助在交互终端中为标题、命令与选项着色，重定向时输出纯文本。设置 `NO_COLOR` 或 `FORCE_COLOR=0` 关闭颜色；`FORCE_COLOR=1` 可强制开启，`NO_COLOR` 优先。颜色使用终端自身的调色板，适应浅色与深色主题。

## 主题

```json
{
  "extends": "nju",
  "name": "My reading theme",
  "primary": "#6f145f",
  "accent": "$primary",
  "body_size": "22px",
  "body_leading": "1.7",
  "brand_logo": null
}
```

省略的字段继承 NJU。字段值可以用 `$字段名` 引用另一个值；未知字段、循环引用和不安全的 CSS 值会报错。自定义标志路径相对主题文件，标志保持原色，不随主色重着色。当前基础主题为 `nju`，布局为 `academic`。

| 字段 | 默认值或用途 |
| --- | --- |
| `background` / `stage` | 白色画布 `#ffffff` / 外部背景 `#eee9ed` |
| `foreground` / `muted` | 正文 `#111111` / 图注 `#666666` |
| `primary` / `accent` | 主色 `#6f145f` / 辅色 `#3159a6` |
| `surface` / `border` | 内容浅底 `#f8f3f7` / 线条 `#d8c1d4` |
| `font_family` | 无衬线字体栈，按本机字体回退 |
| `title_size` / `body_size` / `body_leading` | `36px` / `22px` / `1.7` |
| `page_x` / `page_top` / `page_bottom` | `96px` / `64px` / `56px` |
| `block_gap` / `section_gap` | `18px` / `30px` |
| `title_rule_width` / `title_rule_height` | `160px` / `2px` |
| `brand_logo` / `brand_label` | 本地标志文件 / 替代文字，`null` 隐藏标志 |
| `logo_width` / `logo_height` | `132px` / `44px` |
| `code_canvas` / `code_foreground` | 代码块背景 / 文字颜色 |
| `table_divider` | 表格内部分隔线颜色 |

全部内置色值见 [nju.json](../themes/nju.json)。其中预留的 `code_keyword`、`code_string` 等语法着色字段目前不影响输出，代码块使用统一文字色。`name` 为主题元数据，不显示在页面上。桌面使用 1600×900 逻辑画布并等比缩放；以上几何参数针对该画布。窄屏使用独立字号和间距，便于手机阅读。

## 阅读与打印

左右键切换页面，Home / End 跳转首尾。上下键、空格、滚轮或触控纵向滚动当前页，手机横向滑动翻页。返回上一页时保留该页滚动位置；刷新后从当前页顶部开始。

F 切换全屏，点击插图或聚焦后按 Enter 放大，Esc 关闭。地址末尾的 `#page-3` 定位第三页。浏览器打印会展开所有页面，长页可以跨多张纸。

## 在代码中调用

```js
import { compile } from '@nyllsom/folio';
import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile('notes/pages.md', 'utf8');
const html = await compile(source, { baseDir: 'notes', theme: 'nju' });
await writeFile('pages.html', html);
```

`baseDir` 决定图片路径的基准，默认当前目录。`theme` 为内置主题名或相对当前目录的 JSON 路径。函数返回完整 HTML 字符串，不写入文件。
