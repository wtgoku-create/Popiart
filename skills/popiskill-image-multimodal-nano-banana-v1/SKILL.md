---
name: popiskill-image-multimodal-nano-banana-v1
version: 1.1.0
description: 图片生成与编辑技能。当用户需要生成图片、视觉信息图、创建图像、编辑或修改已有图片时使用。基于 APIYI 的 Nano Banana 2 图像服务，支持文生图、图生图、14 种宽高比和 1K/2K/4K 分辨率。
homepage: https://api.apiyi.com/
user-invocable: true
command-arg-mode: raw
metadata:
  {
    "openclaw":
      {
        "emoji": "🎨",
        "requires": { "bins": ["node"], "env": ["APIYI_API_KEY"] },
        "primaryEnv": "APIYI_API_KEY",
      },
  }
---
# PopiArt Nano Banana 2

基于 APIYI 国内代理服务访问 Nano Banana 2 图像模型。
适合需要一套统一入口同时处理：

- 文生图
- 图生图
- 多张参考图融合
- 多比例画面生成
- 多分辨率图片输出

## 使用指引

遵循以下步骤：

### 第 1 步：判断任务类型

先区分用户当前要的是哪一类：

- 【文生图】从零生成一张新图
- 【图生图】基于已有图片做编辑、重绘、风格转换、加元素或换背景

### 第 2 步：处理提示词

- 默认直接保留用户原始完整输入作为 `--prompt`
- 如果信息不足，只补问最关键缺失项，例如主体、风格、构图、文字内容、禁止元素
- 用户确认后的补充信息应追加到原始提示词后，而不是替换原始提示词

### 第 3 步：推断参数

- `--aspect-ratio`
  - 头像：`1:1`
  - 手机壁纸：`9:16`
  - 横版封面 / 视频封面：`16:9`
  - 小红书 / 社媒竖版内容：`3:4` 或 `4:5`
- `--resolution`
  - 默认建议 `2K`
  - 快速草稿：`1K`
  - 最终出图或高清需求：`4K`
- `--input-image`
  - 仅在图生图时传入
  - 可传多张，最多 14 张

## 命令执行

优先使用 Node.js 版本，因为它是零依赖脚本：

### 文生图

```bash
node {baseDir}/scripts/generate_image.js -p "图片描述文本" -f "output.png" [-a 1:1] [-r 2K]
```

### 图生图

```bash
node {baseDir}/scripts/generate_image.js -p "编辑指令" -i "path/to/input.png" -f "output.png" [-a 3:4] [-r 2K]
```

如果 Node.js 不可用，再使用 Python 版本：

```bash
uv run {baseDir}/scripts/generate_image.py -p "图片描述文本" -f "output.png" [-a 1:1] [-r 2K]
uv run {baseDir}/scripts/generate_image.py -p "编辑指令" -i "path/to/input.png" -f "output.png" [-a 3:4] [-r 2K]
```

注意：

- 始终在用户当前工作目录执行命令，不要 `cd` 到 skill 目录
- 输出文件应保存到用户当前工作目录或其显式指定路径
- 如果输出文件已存在，脚本会自动改名避免覆盖

## 长时间任务提示

在执行前应明确告知用户：

- “图片生成已启动，预计需要 25 秒到 5 分钟。”
- “高质量模式会更慢，正在等待模型返回结果。”

推荐工作流：

1. 先用 `1K` 或 `2K` 跑草稿
2. Prompt 定型后再升到 `4K`

## 常见场景

详细场景建议见 [references/scene.md](references/scene.md)。

例如：

- 微信公众号配图：`-a 1:1` 或 `-a 3:4`
- 小红书笔记：`-a 3:4` 或 `-a 4:5`
- 抖音 / 视频号：`-a 9:16`
- B 站封面：`-a 16:9 -r 2K`
- 活动海报：`-a 2:3` 或 `-a 9:16`

## 参数说明

| 参数 | 必填 | 说明 |
|---|---|---|
| `-p` / `--prompt` | 是 | 图片描述或编辑指令文本 |
| `-f` / `--filename` | 否 | 输出文件路径；不传则自动生成带时间戳文件名 |
| `-a` / `--aspect-ratio` | 否 | 图片比例：`1:1`、`16:9`、`9:16`、`4:3`、`3:4`、`3:2`、`2:3`、`5:4`、`4:5`、`1:4`、`4:1`、`1:8`、`8:1`、`21:9` |
| `-r` / `--resolution` | 否 | 图片分辨率：`1K`、`2K`、`4K`，必须大写 |
| `-i` / `--input-image` | 否 | 输入图片路径；传入后进入编辑模式，可多张 |
| `-k` / `--api-key` | 否 | 临时覆盖环境变量 `APIYI_API_KEY` |

## API Key

脚本按以下顺序获取密钥：

1. `--api-key`
2. `APIYI_API_KEY`

如果都没有，会直接退出并打印错误信息。

获取方式：

1. 访问 [https://api.apiyi.com](https://api.apiyi.com)
2. 注册 / 登录
3. 创建 API Key
4. 设置环境变量：

```bash
export APIYI_API_KEY="your-api-key"
```

## 成功输出

成功时脚本会：

- 保存 PNG 文件到目标路径
- 打印绝对路径
- 打印 `MEDIA:` 行，便于 OpenClaw 等客户端自动附加图片

不要在生成后再把图片读回模型，只需要把输出路径告诉用户。

## 失败处理

常见失败与处理：

- `未设置 APIYI_API_KEY`：先配置环境变量或传 `--api-key`
- `输入图片不存在`：检查路径和文件权限
- `请求超时`：稍后重试，或先降到 `1K`
- `HTTP 4xx/5xx`：检查 key、额度、服务状态或代理接口

## 使用样例

### 生成新图片

```bash
node {baseDir}/scripts/generate_image.js -p "一只可爱的橘猫在草地上玩耍" -f "cat.png"
node {baseDir}/scripts/generate_image.js -p "日落山脉风景" -f "sunset.png" -a 16:9 -r 4K
```

### 编辑已有图片

```bash
node {baseDir}/scripts/generate_image.js -p "将图片转换成水彩画风格" -i "original.png" -f "watercolor.png"
node {baseDir}/scripts/generate_image.js -p "在天空添加彩虹" -i "landscape.png" -f "rainbow.png" -r 2K
node {baseDir}/scripts/generate_image.js -p "参考多张图片融合风格" -i "ref1.png" "ref2.png" -f "merged.png"
```
