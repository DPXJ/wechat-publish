## 微信公众号 Markdown 发布工具（支持 dark 主题自动预处理）

本项目基于 `wechat-publisher-yashu`，用于将本地 Markdown 文章一键发布到微信公众号草稿箱，
并在使用 `dark` 主题时自动为二级/三级标题增加绿色填充块等样式。

### 目录结构（核心文件）

- `index.js`：主发布脚本（读取 `config.json` 并发布到草稿箱）。
- `publish.mjs`：发布入口封装。**推荐使用**，会在 `theme: "dark"` 时自动做预处理。
- `preprocess-dark.mjs`：dark 主题专用预处理脚本，将 `##/###` 转成带内联样式的 HTML。
- `themes/`：主题配置，其中 `dark.json` 定义暗黑主题颜色和排版。
- `config.json`：实际发布时使用的配置（已在 `.gitignore` 中忽略）。
- `SKILL.md`：供 AI 助手识别与调用的技能说明文档。

### 环境要求

- Node.js ≥ 22（建议与本机环境保持一致）。
- Windows 建议在 PowerShell 中执行命令。
- 已在 `config.json` 中正确填写：
  - `markdownFilePath`：Markdown 文件绝对路径；
  - `title`：文章标题；
  - `theme`：主题名称（如 `dark`）；
  - `APP_ID` / `APP_SECRET`：公众号的 AppID / AppSecret；
  - `coverFilePath`：封面图片路径。

### 常规发布（非 dark 主题）

当 `config.json` 中 `theme` 不是 `dark`（或使用其它内置主题）时，可以直接运行：

```bash
# 在项目根目录下
node index.js --config ./config.json
```

脚本会根据 `config.json` 渲染 Markdown 并发布到公众号草稿箱。

### dark 主题发布（自动预处理推荐方式）

当 `config.json` 中：

```json
{
  "markdownFilePath": "D:/path/to/article.md",
  "theme": "dark",
  ...
}
```

时，**推荐始终使用下面的命令发布**：

```bash
# 在项目根目录下
node publish.mjs --config ./config.json
```

该命令会自动完成以下步骤：

1. 读取 `config.json`，检测到 `theme: "dark"`；
2. 调用 `preprocess-dark.mjs` 对 `markdownFilePath` 指向的原始 Markdown 进行预处理：
   - 将 `## 标题` 转成居中的绿色填充块（背景色 `#10B981`、深色文字）；
   - 将 `### 标题` 转成带绿色下划线的标题（文字色 `#059669`，前缀 `■`）；
   - 自动跳过代码块内部的 `##`/`###`；
3. 生成一个 `_processed_*.md` 临时文件，并写入临时 `config` 文件（`.config-dark-publish.json`）；
4. 调用 `index.js --config .config-dark-publish.json` 完成最终发布；
5. 发布结束后自动清理临时 `config` 文件。

**注意：**

- 原始 Markdown 文件保持不变，预处理只作用于中间产物。
- `_processed_*.md` 文件与 `.config-dark-publish.json` 已在 `.gitignore` 中忽略。

### dark 主题的手动预处理（高级用法）

如果你在纯命令行或其他环境下单独使用脚本，也可以手动先跑预处理，再自行调用 `index.js`：

```bash
# 1）手动预处理
node "./preprocess-dark.mjs" "D:/文章/my-article.md" "D:/文章/_processed_my-article.md"

# 2）将 config.json 中的 markdownFilePath 改为处理后的文件
#   \"markdownFilePath\": \"D:/文章/_processed_my-article.md\"

# 3）再执行发布
node index.js --config ./config.json
```

一般情况下，**直接使用 `publish.mjs` 即可完成 dark 主题的自动预处理与发布**。

### 在不同助手/平台中的使用方式

- **Cursor / Claude Code 等支持 SKILL 的环境**
  - 将本项目以 `wechat-publisher-yashu` 的形式安装为全局 skill（例如放到 `~/.agents/skills/`、`~/.claude/skills/` 等目录）。
  - 在对话中说明：待发布 Markdown 路径、期望主题（如 `dark`）、可选前缀/后缀等。
  - 助手会按照 `SKILL.md` 中的流程：自动生成/更新 `config.json`，在 `theme: "dark"` 时优先调用 `publish.mjs`，实现自动预处理 + 发布。

- **OpenClaw 等使用本地 skill 的环境**
  - 将本项目复制为 `~/.openclaw/skills/wechat-publisher-yashu/`。
  - 对话示例：  
    “帮我用 **dark** 主题把 `D:/文章/my-article.md` 发布到公众号草稿箱，并设置标题为 XXX。”
  - skill 会自动写入配置并选择正确的发布命令。

