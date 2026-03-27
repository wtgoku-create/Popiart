#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "requests>=2.31.0",
# ]
# ///
"""
基于 Nano Banana 2 的图片生成与编辑脚本（Python 版）
通过 APIYI 国内代理接口访问 Gemini 3.1 Flash Image Preview。
"""

import argparse
import base64
import json
import mimetypes
import os
import sys
from datetime import datetime
from pathlib import Path


SUPPORTED_ASPECT_RATIOS = [
    "1:1",
    "16:9",
    "9:16",
    "4:3",
    "3:4",
    "3:2",
    "2:3",
    "5:4",
    "4:5",
    "1:4",
    "4:1",
    "1:8",
    "8:1",
    "21:9",
]
SUPPORTED_RESOLUTIONS = ["1K", "2K", "4K"]


def get_api_key(args_key=None):
    if args_key:
        return args_key
    api_key = os.environ.get("APIYI_API_KEY")
    if not api_key:
        print("错误: 未设置 APIYI_API_KEY 环境变量", file=sys.stderr)
        print("请前往 https://api.apiyi.com 注册申请 API Key", file=sys.stderr)
        print("或使用 --api-key 参数临时指定", file=sys.stderr)
        sys.exit(1)
    return api_key


def generate_filename(prompt):
    timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    keywords = prompt.split()[:3]
    keyword_str = "-".join(keywords) or "image"
    keyword_str = "".join(c if c.isalnum() or c in "-_." else "-" for c in keyword_str)
    keyword_str = keyword_str.lower()[:30]
    return f"{timestamp}-{keyword_str}.png"


def add_timestamp_to_filename(filename, timestamp):
    path = Path(filename)
    stem = path.stem or "image"
    suffix = path.suffix
    return str(path.with_name(f"{stem}-{timestamp}{suffix}"))


def guess_mime_type(image_path):
    mime_type, _ = mimetypes.guess_type(image_path)
    if mime_type and mime_type.startswith("image/"):
        return mime_type
    return "image/png"


def encode_image_to_base64(image_path):
    try:
        with open(image_path, "rb") as file:
            return base64.b64encode(file.read()).decode("utf-8")
    except Exception as error:
        print(f"错误: 无法读取图片文件 {image_path} - {error}", file=sys.stderr)
        sys.exit(1)


def build_payload(prompt, aspect_ratio=None, resolution=None, input_images=None):
    parts = [{"text": prompt}]
    if input_images:
        for image_path in input_images:
            if not os.path.exists(image_path):
                print(f"错误: 输入图片不存在: {image_path}", file=sys.stderr)
                sys.exit(1)
            parts.append(
                {
                    "inlineData": {
                        "mimeType": guess_mime_type(image_path),
                        "data": encode_image_to_base64(image_path),
                    }
                }
            )

    generation_config = {"responseModalities": ["IMAGE"]}
    image_config = {}
    if aspect_ratio is not None:
        image_config["aspectRatio"] = aspect_ratio
    if resolution is not None:
        image_config["imageSize"] = resolution
    if image_config:
        generation_config["imageConfig"] = image_config

    return {
        "contents": [{"parts": parts}],
        "generationConfig": generation_config,
    }


def print_payload_log(payload):
    payload_log = {
        "generationConfig": payload.get("generationConfig", {}),
        "contents": [],
    }
    for content in payload.get("contents", []):
        parts_log = []
        for part in content.get("parts", []):
            if isinstance(part, dict) and "inlineData" in part:
                inline_data = dict(part["inlineData"])
                data_value = inline_data.get("data")
                if isinstance(data_value, str):
                    inline_data["data"] = f"<omitted base64: {len(data_value)} chars>"
                parts_log.append({"inlineData": inline_data})
            else:
                parts_log.append(part)
        payload_log["contents"].append({"parts": parts_log})
    print(f"输出请求参数: {json.dumps(payload_log, indent=2, ensure_ascii=False)}")


def generate_image(prompt, filename, aspect_ratio=None, resolution=None, input_images=None, api_key=None):
    if aspect_ratio is not None and aspect_ratio not in SUPPORTED_ASPECT_RATIOS:
        print(f"错误: 不支持的比例 '{aspect_ratio}'", file=sys.stderr)
        print(f"支持的比例: {', '.join(SUPPORTED_ASPECT_RATIOS)}", file=sys.stderr)
        sys.exit(1)

    if resolution is not None and resolution not in SUPPORTED_RESOLUTIONS:
        print(f"错误: 不支持的分辨率 '{resolution}'", file=sys.stderr)
        print(f"支持的分辨率: {', '.join(SUPPORTED_RESOLUTIONS)} (必须大写)", file=sys.stderr)
        sys.exit(1)

    api_key = get_api_key(api_key)
    requests = __import__("requests")

    url = "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = build_payload(prompt, aspect_ratio=aspect_ratio, resolution=resolution, input_images=input_images)

    mode = "编辑图片" if input_images else "生成图片"
    print(f"正在{mode}...")
    print(f"提示词: {prompt}")
    image_config = payload.get("generationConfig", {}).get("imageConfig", {})
    if image_config.get("aspectRatio"):
        print(f"比例: {image_config['aspectRatio']}")
    if image_config.get("imageSize"):
        print(f"分辨率: {image_config['imageSize']}")
    print_payload_log(payload)
    print("image generation in progress...")

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=400)
        response.raise_for_status()
        data = response.json()
        image_data = None
        if "candidates" in data and data["candidates"]:
            candidate = data["candidates"][0]
            image_data = candidate["content"]["parts"][0]["inlineData"]["data"]

        if not image_data:
            print("错误: 响应中未找到图片数据", file=sys.stderr)
            print(f"完整响应: {json.dumps(data, indent=2, ensure_ascii=False)}", file=sys.stderr)
            sys.exit(1)

        image_bytes = base64.b64decode(image_data)
        output_file = Path(filename)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, "wb") as file:
            file.write(image_bytes)

        full_path = output_file.resolve()
        print(f"✓ 图片已成功{mode}并保存到: {filename}")
        print(f"MEDIA: {full_path}")
        return str(full_path)
    except requests.exceptions.Timeout:
        print("错误: 请求超时，请稍后重试", file=sys.stderr)
        sys.exit(1)
    except requests.exceptions.RequestException as error:
        print(f"错误: 请求失败 - {error}", file=sys.stderr)
        if getattr(error, "response", None) is not None:
            try:
                print(
                    f"错误详情: {json.dumps(error.response.json(), indent=2, ensure_ascii=False)}",
                    file=sys.stderr,
                )
            except Exception:
                print(f"响应状态码: {error.response.status_code}", file=sys.stderr)
                print(f"响应内容: {error.response.text}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="基于 Nano Banana 2 的图片生成与编辑工具（Python 版）",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用示例:
  uv run generate_image.py -p "一只可爱的橘猫"
  uv run generate_image.py -p "日落山脉" -a 16:9 -r 4K
  uv run generate_image.py -p "城市夜景" -a 9:16 -r 2K -f wallpaper.png
  uv run generate_image.py -p "转换成油画风格" -i original.png
  uv run generate_image.py -p "参考多张图片融合风格" -i ref1.png ref2.png -f merged.png
        """,
    )
    parser.add_argument("--prompt", "-p", required=True, help="图片描述或编辑指令文本")
    parser.add_argument("--filename", "-f", default=None, help="输出文件路径，不传则自动生成文件名")
    parser.add_argument("--aspect-ratio", "-a", default=None, choices=SUPPORTED_ASPECT_RATIOS, help="图片比例")
    parser.add_argument("--resolution", "-r", default=None, choices=SUPPORTED_RESOLUTIONS, help="图片分辨率（1K/2K/4K）")
    parser.add_argument("--input-image", "-i", nargs="+", default=None, help="输入图片路径，可传多张，最多 14 张")
    parser.add_argument("--api-key", "-k", default=None, help="覆盖环境变量 APIYI_API_KEY")

    args = parser.parse_args()
    if args.input_image and len(args.input_image) > 14:
        print(f"错误: 输入图片最多支持 14 张，当前为 {len(args.input_image)} 张", file=sys.stderr)
        sys.exit(1)

    run_timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    if args.filename is None:
        args.filename = generate_filename(args.prompt)
    else:
        output_path = Path(args.filename)
        if output_path.exists():
            adjusted = add_timestamp_to_filename(args.filename, run_timestamp)
            print(f"警告: 输出文件已存在，将避免覆盖并改为: {adjusted}")
            args.filename = adjusted

    generate_image(
        prompt=args.prompt,
        filename=args.filename,
        aspect_ratio=args.aspect_ratio,
        resolution=args.resolution,
        input_images=args.input_image,
        api_key=args.api_key,
    )


if __name__ == "__main__":
    main()
