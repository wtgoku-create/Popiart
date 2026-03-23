---
name: popiskill-image-img2img-popistudio-alice-showcase-v1
description: Generate one showcase image for PopiStudio Alice with strict character consistency. Use this when a creator agent needs a single Alice keyframe, proof frame, or demo image based on the hosted Alice reference image.
---

# PopiStudio Alice Showcase

This skill is a showcase-style image-to-image workflow for the PopiStudio Alice
character.

Use it when the goal is to:

- generate one Alice showcase frame for demos or presentations
- keep Alice as the fixed main protagonist across new scenes
- test character-consistent img2img flow with a hosted reference image
- create one storyboard proof frame before moving into a larger sequence

Do not use this skill for:

- text-only generation without a reference image
- multi-image batch generation
- turning Alice into a different character
- long-form video output

## Fixed reference

Always use this hosted Alice reference image as the canonical source:

`http://8.136.121.101:8790/media/Character_id_card/alice.jpg`

The reference image is not a loose style hint. Alice must remain the complete
main protagonist in the generated image.

## Required inputs

- `scene_prompt`: the new scene or action for Alice

## Optional inputs

- `shot_type`: for example `medium shot`, `close-up`, `wide shot`
- `camera`: for example `eye level`, `slight low angle`
- `mood`: short emotional or lighting direction
- `aspect_ratio`: for example `1:1`, `16:9`, `9:16`
- `retry_on_character_drift`: default `true`

## Character guardrails

The prompt must preserve:

- same Alice identity
- same anime facial structure and recognizability
- same hairstyle and hair color
- same clothing language and main palette
- Alice as the visual center of the frame

## Scene guardrails

This showcase skill is tuned for:

- real-world modern Chinese life scenes
- Sony-style photo realism
- natural light
- warm realistic tone
- high-detail presentation quality

Recommended scene clause:

```text
real-world modern Chinese living scene, Sony photo realism, natural light, warm realistic tone, high detail, clean composition
```

## Workflow

1. Use the fixed Alice reference image URL.
2. Build one prompt that combines:
   - Alice identity consistency
   - the user scene
   - the modern Chinese real-life visual direction
3. Run one img2img generation only.
4. Wait for the job to finish.
5. Pull the artifact if the user wants the local file.
6. If Alice is not clearly preserved as the main protagonist, rerun once with stronger character wording.

## Command pattern

```sh
popiart run popiskill-image-img2img-popistudio-alice-showcase-v1 --input @params.json --wait
```

Inline example:

```sh
popiart run popiskill-image-img2img-popistudio-alice-showcase-v1 --input '{"scene_prompt":"Alice waits outside a neighborhood convenience store at dusk, holding milk tea","shot_type":"medium shot","mood":"quiet and warm","aspect_ratio":"16:9"}' --wait
```

## Payload template

```json
{
  "reference_image_url": "http://8.136.121.101:8790/media/Character_id_card/alice.jpg",
  "scene_prompt": "Alice waits outside a neighborhood convenience store at dusk, holding milk tea",
  "shot_type": "medium shot",
  "camera": "eye level",
  "mood": "quiet and warm",
  "aspect_ratio": "16:9",
  "retry_on_character_drift": true
}
```

## Output handling

- read `artifact_ids` from the finished job
- use `popiart artifacts pull <artifact-id>` to save the image locally
- record whether Alice consistency passed or needs one retry

## Operating guidance

- Keep the request to one frame only. This is a showcase skill, not a full episode workflow.
- Prefer everyday Chinese modern-life scenes over abstract fantasy scenes.
- If the user wants a multi-shot sequence, hand off to a storyboard or video-oriented Alice workflow.
- If the user wants a different protagonist, do not use this skill.
