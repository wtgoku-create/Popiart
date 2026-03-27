#!/usr/bin/env node
/*
基于 Nano Banana 2 的图片生成与编辑脚本（Node.js 版）
通过 APIYI 国内代理接口访问 Gemini 3.1 Flash Image Preview。
*/

const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPPORTED_ASPECT_RATIOS = [
  '1:1',
  '16:9',
  '9:16',
  '4:3',
  '3:4',
  '3:2',
  '2:3',
  '5:4',
  '4:5',
  '1:4',
  '4:1',
  '1:8',
  '8:1',
  '21:9',
];

const SUPPORTED_RESOLUTIONS = ['1K', '2K', '4K'];

function printHelpAndExit(exitCode = 0) {
  const help = `usage: generate_image.js [-h] --prompt PROMPT [--filename FILENAME]
                        [--aspect-ratio ${SUPPORTED_ASPECT_RATIOS.join(', ')}]
                        [--resolution ${SUPPORTED_RESOLUTIONS.join(', ')}]
                        [--input-image INPUT_IMAGE [INPUT_IMAGE ...]]
                        [--api-key API_KEY]

基于 Nano Banana 2 的图片生成与编辑工具（Node.js 版）

options:
  -h, --help            show this help message and exit
  -p, --prompt PROMPT   图片描述或编辑指令文本（必需）
  -f, --filename FILE   输出图片路径（默认：自动生成时间戳文件名）
  -a, --aspect-ratio    图片比例（可选）
  -r, --resolution      图片分辨率（可选：1K, 2K, 4K，必须大写）
  -i, --input-image     输入图片路径（编辑模式，可传多张，最多 14 张）
  -k, --api-key         API 密钥（覆盖环境变量）
`;
  process.stdout.write(help);
  process.exit(exitCode);
}

function exitWithError(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatTimestamp(dateObj) {
  const d = dateObj || new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}-${pad2(d.getHours())}-${pad2(d.getMinutes())}-${pad2(d.getSeconds())}`;
}

function addTimestampToFilename(filePath, timestamp) {
  const ts = timestamp || formatTimestamp(new Date());
  const parsed = path.parse(filePath);
  const base = parsed.name ? `${parsed.name}-${ts}` : ts;
  return path.join(parsed.dir || '.', `${base}${parsed.ext || ''}`);
}

function generateFilename(prompt) {
  const timestamp = formatTimestamp(new Date());
  const keywords = String(prompt).split(/\s+/).filter(Boolean).slice(0, 3);
  const keywordStrRaw = keywords.join('-') || 'image';
  const keywordStr = keywordStrRaw
    .split('')
    .map((c) => (/^[a-zA-Z0-9\-_.]$/.test(c) ? c : '-'))
    .join('')
    .toLowerCase()
    .slice(0, 30);
  return `${timestamp}-${keywordStr}.png`;
}

function getApiKey(argsKey) {
  if (argsKey) return argsKey;
  const apiKey = process.env.APIYI_API_KEY;
  if (!apiKey) {
    exitWithError(
      '错误: 未设置 APIYI_API_KEY 环境变量\n' +
        '请前往 https://api.apiyi.com 注册申请 API Key\n' +
        '或使用 -k/--api-key 参数临时指定'
    );
  }
  return apiKey;
}

function guessMimeType(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.bmp':
      return 'image/bmp';
    case '.png':
    default:
      return 'image/png';
  }
}

function encodeImageToBase64(imagePath) {
  try {
    return fs.readFileSync(imagePath).toString('base64');
  } catch (error) {
    exitWithError(`错误: 无法读取图片文件 ${imagePath} - ${error.message || String(error)}`);
  }
}

function postJson(urlString, headers, payload, timeoutMs) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const body = Buffer.from(JSON.stringify(payload), 'utf8');
    const req = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': body.length,
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (d) => chunks.push(d));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          const statusCode = res.statusCode || 0;
          if (statusCode < 200 || statusCode >= 300) {
            const err = new Error(`HTTP ${statusCode}`);
            err.statusCode = statusCode;
            err.responseText = text;
            return reject(err);
          }
          try {
            resolve(JSON.parse(text));
          } catch (error) {
            const err = new Error('响应不是有效的 JSON');
            err.responseText = text;
            reject(err);
          }
        });
      }
    );

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('timeout'));
    });
    req.write(body);
    req.end();
  });
}

function parseArgs(argv) {
  const args = {
    prompt: null,
    filename: null,
    aspectRatio: null,
    resolution: null,
    inputImages: null,
    apiKey: null,
  };

  const knownFlags = new Set([
    '-h',
    '--help',
    '-p',
    '--prompt',
    '-f',
    '--filename',
    '-a',
    '--aspect-ratio',
    '-r',
    '--resolution',
    '-i',
    '--input-image',
    '-k',
    '--api-key',
  ]);

  function requireValue(i, flag) {
    const value = argv[i + 1];
    if (!value || (value.startsWith('-') && knownFlags.has(value))) {
      exitWithError(`错误: 参数 ${flag} 需要一个值`);
    }
    return value;
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      printHelpAndExit(0);
    }
    if (arg === '-p' || arg === '--prompt') {
      args.prompt = requireValue(i, arg);
      i++;
      continue;
    }
    if (arg === '-f' || arg === '--filename') {
      args.filename = requireValue(i, arg);
      i++;
      continue;
    }
    if (arg === '-a' || arg === '--aspect-ratio') {
      args.aspectRatio = requireValue(i, arg);
      i++;
      continue;
    }
    if (arg === '-r' || arg === '--resolution') {
      args.resolution = requireValue(i, arg);
      i++;
      continue;
    }
    if (arg === '-k' || arg === '--api-key') {
      args.apiKey = requireValue(i, arg);
      i++;
      continue;
    }
    if (arg === '-i' || arg === '--input-image') {
      const images = [];
      let j = i + 1;
      while (j < argv.length) {
        const value = argv[j];
        if (value.startsWith('-') && knownFlags.has(value)) break;
        images.push(value);
        j++;
      }
      if (images.length === 0) {
        exitWithError(`错误: 参数 ${arg} 需要至少一个图片路径`);
      }
      args.inputImages = images;
      i = j - 1;
      continue;
    }
    if (arg.startsWith('-')) {
      exitWithError(`错误: 未知参数 ${arg}，请使用 --help 查看帮助`);
    }
  }

  if (!args.prompt) {
    exitWithError('错误: 缺少必需参数 -p/--prompt');
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const runTimestamp = formatTimestamp(new Date());

  if (args.aspectRatio != null && !SUPPORTED_ASPECT_RATIOS.includes(args.aspectRatio)) {
    exitWithError(`错误: 不支持的比例 '${args.aspectRatio}'`);
  }
  if (args.resolution != null && !SUPPORTED_RESOLUTIONS.includes(args.resolution)) {
    exitWithError(`错误: 不支持的分辨率 '${args.resolution}'`);
  }

  if (!args.filename) {
    args.filename = generateFilename(args.prompt);
  } else {
    const resolved = path.resolve(args.filename);
    if (fs.existsSync(resolved)) {
      const adjusted = addTimestampToFilename(args.filename, runTimestamp);
      process.stdout.write(`⚠️ 输出文件已存在，将避免覆盖并改为: ${adjusted}\n`);
      args.filename = adjusted;
    }
  }

  if (args.inputImages && args.inputImages.length > 14) {
    exitWithError(`错误: 输入图片最多支持 14 张，当前为 ${args.inputImages.length} 张`);
  }

  const apiKey = getApiKey(args.apiKey);
  const url = 'https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent';
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const parts = [{ text: args.prompt }];
  if (args.inputImages) {
    for (const imgPath of args.inputImages) {
      if (!fs.existsSync(imgPath)) {
        exitWithError(`错误: 输入图片不存在: ${imgPath}`);
      }
      parts.push({
        inlineData: {
          mimeType: guessMimeType(imgPath),
          data: encodeImageToBase64(imgPath),
        },
      });
    }
  }

  const generationConfig = {
    responseModalities: ['IMAGE'],
  };
  const imageConfig = {};
  if (args.aspectRatio != null) imageConfig.aspectRatio = args.aspectRatio;
  if (args.resolution != null) imageConfig.imageSize = args.resolution;
  if (Object.keys(imageConfig).length > 0) generationConfig.imageConfig = imageConfig;

  const payload = {
    contents: [{ parts }],
    generationConfig,
  };

  const modeStr = args.inputImages ? '编辑图片' : '生成图片';
  process.stdout.write(`正在${modeStr}...\n`);
  process.stdout.write(`提示词: ${args.prompt}\n`);
  if (generationConfig.imageConfig && generationConfig.imageConfig.aspectRatio) {
    process.stdout.write(`比例: ${generationConfig.imageConfig.aspectRatio}\n`);
  }
  if (generationConfig.imageConfig && generationConfig.imageConfig.imageSize) {
    process.stdout.write(`分辨率: ${generationConfig.imageConfig.imageSize}\n`);
  }

  const payloadLog = {
    generationConfig,
    contents: [],
  };
  for (const content of payload.contents || []) {
    const partsLog = [];
    for (const part of content.parts || []) {
      if (part && typeof part === 'object' && part.inlineData && typeof part.inlineData === 'object') {
        const inlineData = { ...part.inlineData };
        if (typeof inlineData.data === 'string') {
          inlineData.data = `<omitted base64: ${inlineData.data.length} chars>`;
        }
        partsLog.push({ inlineData });
      } else {
        partsLog.push(part);
      }
    }
    payloadLog.contents.push({ parts: partsLog });
  }
  process.stdout.write(`输出请求参数: ${JSON.stringify(payloadLog, null, 2)}\n`);
  process.stdout.write('image generation in progress...\n');

  let data;
  try {
    data = await postJson(url, headers, payload, 120_000);
  } catch (error) {
    if (error && error.message === 'timeout') {
      exitWithError('错误: 请求超时，请稍后重试');
    }
    if (error && error.statusCode) {
      process.stderr.write(`错误: 请求失败 - HTTP ${error.statusCode}\n`);
      if (error.responseText) {
        try {
          const detail = JSON.parse(error.responseText);
          process.stderr.write(`错误详情: ${JSON.stringify(detail, null, 2)}\n`);
        } catch {
          process.stderr.write(`响应内容: ${error.responseText}\n`);
        }
      }
      process.exit(1);
    }
    exitWithError(`错误: 请求失败 - ${error.message || String(error)}`);
  }

  const imageData =
    data &&
    data.candidates &&
    Array.isArray(data.candidates) &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] &&
    data.candidates[0].content.parts[0].inlineData &&
    data.candidates[0].content.parts[0].inlineData.data;

  if (!imageData) {
    process.stderr.write('错误: 响应中未找到图片数据\n');
    process.stderr.write(`完整响应: ${JSON.stringify(data, null, 2)}\n`);
    process.exit(1);
  }

  const outputFile = path.resolve(args.filename);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, Buffer.from(imageData, 'base64'));

  process.stdout.write(`✓ 图片已成功${modeStr}并保存到: ${args.filename}\n`);
  process.stdout.write(`MEDIA: ${outputFile}\n`);
}

main().catch((error) => {
  exitWithError(`错误: ${error && error.message ? error.message : String(error)}`);
});
