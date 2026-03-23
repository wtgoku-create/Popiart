---
name: popiskill-video-image2video-popistudio-alice-showcase-v1
description: Generate one short showcase video for PopiStudio Alice with strict character consistency. Use this when a creator agent needs a single Alice motion demo, teaser shot, or animated proof clip from the hosted Alice reference image or an Alice keyframe artifact.
---

# PopiStudio Alice Video Showcase

This skill is a showcase-style image-to-video workflow for the PopiStudio Alice
character.

Use it when the goal is to:

- turn one Alice frame into one short motion clip
- create a teaser shot or demo clip for PopiStudio
- validate Alice character consistency in a simple video workflow
- test image-to-video routing for creator agents

Do not use this skill for:

- long-form editing
- multi-shot sequences
- text-only video generation
- changing Alice into another protagonist

## Source image rules

Prefer one of these sources:

1. `source_artifact_id` from a previous PopiArt Alice image result
2. the fixed hosted Alice reference image:

`http://8.136.121.101:8790/media/Character_id_card/alice.jpg`

If both are provided, prefer `source_artifact_id`.

## Required inputs

- one image source:
  - `source_artifact_id`, or
  - `image_url`

## Optional inputs

- `motion_prompt`: short motion direction
- `duration_s`: recommended `3` to `5`
- `camera_motion`: for example `slow push-in`, `slight handheld drift`, `gentle pan`
- `mood`: short emotional tone
- `aspect_ratio`: for example `16:9` or `9:16`
- `retry_on_character_drift`: default `true`

## Character guardrails

The clip must preserve:

- same Alice identity
- same anime facial structure and recognizability
- same hairstyle and hair color
- same clothing language and main palette
- Alice as the clear main protagonist through the shot

## Motion guardrails

This showcase skill should stay simple:

- one short shot only
- one dominant motion instruction
- limited camera movement
- no complex action choreography

Recommended visual direction:

```text
real-world modern Chinese living scene, Sony photo realism, natural light, warm realistic tone, cinematic but restrained motion, high-detail presentation quality
```

## Workflow

1. Resolve the image source.
2. If there is no prior Alice artifact, use the hosted Alice reference image.
3. Build one short motion prompt that combines:
   - Alice identity consistency
   - one motion direction
   - the modern Chinese real-life visual direction
4. Run one image-to-video generation only.
5. Wait for the job to finish.
6. Pull the video artifact if the user wants the local file.
7. If Alice drifts too far from the source identity, rerun once with stronger consistency wording and simpler motion.

## Command pattern

```sh
popiart run popiskill-video-image2video-popistudio-alice-showcase-v1 --input @params.json --wait
```

Inline example:

```sh
popiart run popiskill-video-image2video-popistudio-alice-showcase-v1 --input '{"image_url":"http://8.136.121.101:8790/media/Character_id_card/alice.jpg","motion_prompt":"Alice looks up and smiles while the camera slowly pushes in","duration_s":4,"camera_motion":"slow push-in","aspect_ratio":"16:9"}' --wait
```

## Payload template

```json
{
  "image_url": "http://8.136.121.101:8790/media/Character_id_card/alice.jpg",
  "motion_prompt": "Alice looks up and smiles while the camera slowly pushes in",
  "duration_s": 4,
  "camera_motion": "slow push-in",
  "mood": "warm and hopeful",
  "aspect_ratio": "16:9",
  "retry_on_character_drift": true
}
```

Version with artifact input:

```json
{
  "source_artifact_id": "art_123",
  "motion_prompt": "Alice turns toward the window as soft wind moves her hair",
  "duration_s": 4,
  "camera_motion": "gentle pan",
  "aspect_ratio": "16:9"
}
```

## Output handling

- read `artifact_ids` from the finished job
- pull the video artifact with `popiart artifacts pull <artifact-id>`
- record whether Alice consistency passed or needs one retry

## Operating guidance

- Keep the clip short and legible. This is a showcase skill, not a full episode workflow.
- Prefer subtle performance and restrained camera motion.
- If the user needs multiple connected shots, move into a storyboard or sequence workflow.
- If the user needs a fresh Alice still first, run the Alice image showcase skill before this one.
