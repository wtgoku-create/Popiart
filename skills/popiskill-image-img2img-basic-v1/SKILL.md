---
name: popiskill-image-img2img-basic-v1
description: Transform one existing image into a new image through popiart. Use this when the user already has a source image and wants the simplest possible image-to-image test flow for redraws, style transfer, or pipeline validation.
---

# PopiArt Image To Image Basic

This skill is the simplest img2img path in PopiArt.

Use it when the goal is to:

- take one existing image and restyle or redraw it
- validate that image-conditioned generation works
- make a lightweight variation from a prior artifact or image URL

Do not use this skill for:

- text-only generation
- multi-step retouch pipelines
- video generation

## Required inputs

- `prompt`: the transformation intent
- one image source:
  - `source_artifact_id`, or
  - `image_url`

## Optional inputs

- `strength`: how strongly to transform the source, usually `0.2` to `0.8`
- `style`
- `seed`

## Workflow

1. Prefer `source_artifact_id` when the image comes from a previous PopiArt job.
2. Use `image_url` only when the source already lives at a reachable URL.
3. Build the smallest valid payload.
4. Run the skill through `popiart`.
5. Wait for completion and pull the output artifact if needed.

## Command pattern

```sh
popiart run popiskill-image-img2img-basic-v1 --input @params.json --wait
```

Inline example:

```sh
popiart run popiskill-image-img2img-basic-v1 --input '{"prompt":"convert this into a watercolor illustration","source_artifact_id":"art_123","strength":0.6}' --wait
```

## Payload template

```json
{
  "prompt": "convert this into a watercolor illustration",
  "source_artifact_id": "art_123",
  "strength": 0.6,
  "style": "soft pastel",
  "seed": 42
}
```

## Output handling

- inspect `artifact_ids` from the completed job
- pull the selected artifact with `popiart artifacts pull <artifact-id>`

## Operating guidance

- If no source image exists yet, switch to the text2image skill first.
- Keep this skill focused on one source image and one output direction.
- If the user wants motion from the result, hand off to the image2video skill.
