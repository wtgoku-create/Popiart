---
name: popiskill-image-text2image-three-view-v1
description: Generate a front, side, and back full-body character sheet through popiart. Use this when the user wants 三视图, turnaround sheets, or a production-friendly character reference with consistent proportions and styling.
---

# PopiArt Three View

This skill is the focused text-to-image path for character three-view sheets in PopiArt.

Use it when the goal is to:

- generate a clean `front`, `side`, and `back` full-body reference
- lock character silhouette, outfit, and color direction before storyboarding or model work
- produce a reviewable turnaround sheet instead of one hero image

Do not use this skill for:

- single-image concept art with no turnaround requirement
- image editing based on an existing source image
- motion or video output

## Required inputs

- `character_prompt`: the single source brief that defines the same character across all views

## Optional inputs

- `style`: short style hint such as `anime`, `semi-realistic`, or `storybook`
- `aspect_ratio`: recommended `4:5` or `3:4`
- `pose_mode`: for example `neutral-a-pose`, `neutral-t-pose`, or `natural-standing`
- `background_mode`: for example `clean-card`, `plain`, or `transparent`
- `views`: defaults to `["front","side","back"]`
- `reference_artifact_ids`: prior PopiArt artifact IDs that should anchor likeness or costume
- `include_items`: whether to add a small prop cluster
- `include_palette`: whether to add palette swatches
- `expression_count`: integer from `0` to `10`
- `include_seasonal_outfits`: whether to add winter and summer outfit callouts
- `action_count`: integer from `0` to `5`
- `notes`: extra constraints such as no foreshortening or production-safe line cleanup

## Workflow

1. Normalize the character brief into one stable identity anchor.
2. Generate matching `front`, `side`, and `back` full-body views.
3. Add optional sheet extras when requested.
4. Return the final sheet artifact and any supporting metadata artifacts.

## Command pattern

```sh
popiart run popiskill-image-text2image-three-view-v1 --input @params.json --wait
```

## Payload template

```json
{
  "character_prompt": "A cheerful fox-themed teenage courier girl with short orange hair, oversized cream hoodie, utility skirt, striped socks, canvas satchel, and a small bell charm. Clean anime linework, warm autumn palette, full-body turnaround sheet, consistent proportions, no dramatic perspective.",
  "style": "anime",
  "aspect_ratio": "4:5",
  "pose_mode": "neutral-a-pose",
  "background_mode": "clean-card",
  "views": ["front", "side", "back"],
  "include_items": true,
  "include_palette": true,
  "expression_count": 4,
  "include_seasonal_outfits": false,
  "action_count": 2,
  "notes": "Prioritize silhouette clarity and consistent proportions."
}
```

## Output handling

After the job finishes:

- read `artifact_ids` from the result
- use `popiart artifacts pull <artifact-id>` to save one artifact locally
- use `popiart artifacts pull-all <job-id>` to save the full sheet output set

## Operating guidance

- Keep the character brief specific and stable across outfit, palette, and body proportion details.
- If the user only wants a single hero frame, switch to a basic text-to-image skill.
- If the user already has a locked source image and wants revision rather than fresh generation, switch to an img2img skill.
- If the user wants motion, switch to an image-to-video skill.
