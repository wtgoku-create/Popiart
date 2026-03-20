---
name: popiskill-image-text2image-basic-v1
description: Generate a single image from a text prompt through popiart. Use this when the user wants the simplest possible text-to-image flow for testing, quick concept art, style exploration, or validating that the PopiArt image pipeline is working.
---

# PopiArt Text To Image Basic

This skill is the simplest text-to-image path in PopiArt.

Use it when the goal is to:

- turn one prompt into one image
- test that `popiart` auth, routing, jobs, and artifacts are working
- create a quick visual concept without advanced workflow logic

Do not use this skill for:

- multi-image batches
- storyboard generation
- image editing based on an existing image
- video output

## Required inputs

- `prompt`: the main text prompt

## Optional inputs

- `style`: short style hint
- `aspect_ratio`: for example `1:1`, `16:9`, `9:16`
- `seed`: integer seed when reproducibility matters

## Workflow

1. Confirm `popiart` is authenticated if needed.
2. Build the smallest valid JSON payload.
3. Run the skill through the CLI.
4. Wait for completion.
5. Pull the resulting artifact if the user wants the local file.

## Command pattern

```sh
popiart run popiskill-image-text2image-basic-v1 --input @params.json --wait
```

Inline example:

```sh
popiart run popiskill-image-text2image-basic-v1 --input '{"prompt":"a cinematic tea shop at sunset","aspect_ratio":"16:9"}' --wait
```

## Payload template

```json
{
  "prompt": "a cinematic tea shop at sunset",
  "style": "soft anime lighting",
  "aspect_ratio": "16:9",
  "seed": 42
}
```

## Output handling

After the job finishes:

- read `artifact_ids` from the result
- use `popiart artifacts pull <artifact-id>` to save the file locally when needed

## Operating guidance

- Keep prompts simple and direct for this basic skill.
- If the user starts asking for source image conditioning, switch to the img2img skill.
- If the user wants motion, switch to the image2video skill.
