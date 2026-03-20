---
name: popiskill-video-image2video-basic-v1
description: Turn one source image into a short video through popiart. Use this when the user wants the simplest possible image-to-video test flow for motion previews, short animated shots, or validating that the PopiArt video pipeline is working.
---

# PopiArt Image To Video Basic

This skill is the simplest image-to-video path in PopiArt.

Use it when the goal is to:

- animate one still image into a short clip
- validate the basic video pipeline
- generate a quick motion preview from an image artifact or image URL

Do not use this skill for:

- long-form video editing
- multi-shot generation
- storyboard planning
- text-only video generation

## Required inputs

- one image source:
  - `source_artifact_id`, or
  - `image_url`

## Optional inputs

- `prompt`: motion direction or scene behavior
- `duration_s`: short clip length
- `camera_motion`
- `seed`

## Workflow

1. Prefer `source_artifact_id` when the source image already comes from PopiArt.
2. Keep the clip short for this basic skill.
3. Provide only one clear motion instruction.
4. Run through `popiart` and wait for the job.
5. Pull the resulting artifact if the user wants the local file.

## Command pattern

```sh
popiart run popiskill-video-image2video-basic-v1 --input @params.json --wait
```

Inline example:

```sh
popiart run popiskill-video-image2video-basic-v1 --input '{"source_artifact_id":"art_123","prompt":"the camera slowly pushes in while the hair moves in the wind","duration_s":4}' --wait
```

## Payload template

```json
{
  "source_artifact_id": "art_123",
  "prompt": "the camera slowly pushes in while the hair moves in the wind",
  "duration_s": 4,
  "camera_motion": "slow push-in",
  "seed": 42
}
```

## Output handling

- read `artifact_ids` from the finished job
- pull the video artifact with `popiart artifacts pull <artifact-id>`

## Operating guidance

- Start with short clips and simple camera motion.
- If the user only has text, use a text2image skill first to create the starting frame.
- If the user wants more than one shot, break the request into separate runs.
