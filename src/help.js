import { fileURLToPath } from 'node:url';

const conversionGuide = fileURLToPath(new URL('../prompts/README.md', import.meta.url));

export const help = {
  overview: `FOLIO — from slides to readable pages.

folio bind pages.md           编译成可离线阅读的 HTML
folio example                查看随包范例的位置
folio example --copy my-pages 复制范例后开始写作
folio theme init             生成可编辑主题

folio help bind              编译帮助
folio help theme             主题帮助

Agent：运行 folio help agent 阅读转换指南；输入或目标不明确时，先询问用户。`,
  agent: `folio — 材料转阅读页

先从对话、附件和工作目录确认输入与目标，仅询问缺失的必要信息。
读取转换指南，按章节整理正文与插图，再运行 folio bind 并检查生成页面。
转换指南（当前安装位置）：
${conversionGuide}`,
  bind: `folio bind <稿件.md> [-o 输出.html] [--theme nju|主题.json]

# 文档标题，## 新的一页，### 页内主题。
默认生成稿件旁的同名 HTML；-o 创建父目录并覆盖已有输出。
本地图片相对稿件定位，主题文件相对当前目录定位。
正文、图片、主题和播放器嵌入单文件，阅读时无需服务器。
左右键翻页，上下滚动长页，F 全屏，点击插图放大。`,
  theme: `folio theme init [-o theme.json]
folio bind pages.md --theme theme.json

默认 NJU 主题。JSON 使用 extends: "nju"，只写需要覆盖的字段。
primary / accent：主色与辅色；background / stage：画布与舞台。
body_size / body_leading：正文字号与行高；font_family：字体栈。
brand_logo：相对主题文件的图片路径，设为 null 隐藏标志。
字段可用 "$primary" 形式相互引用。init 不覆盖已有文件。
完整字段见 examples/reference.md。`,
  example: `folio example
folio example --copy my-pages

显示内置两页范例的 HTML 位置，或复制稿件、插图和预览。
复制目标必须尚不存在。复制后运行 folio bind my-pages/pages.md。`
};
