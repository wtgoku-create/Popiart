# Popiart Skillhub

Anthropic-style skill repository for PopiArt.

This repo is aimed at two primary users:

- creator agents that need discoverable, reusable skills
- creators who want a clear, inspectable skill library

## Layout

```text
skills/
  skill-creator/                         upstream reference skill from anthropics/skills
  popiskill-image-text2image-basic-v1/  basic text-to-image test skill
  popiskill-image-img2img-basic-v1/     basic image-to-image test skill
  popiskill-image-img2img-popistudio-alice-showcase-v1/ PopiStudio Alice showcase skill
  popiskill-video-image2video-basic-v1/ basic image-to-video test skill
  popiskill-video-image2video-popistudio-alice-showcase-v1/ PopiStudio Alice video showcase skill
index.json
```

## Naming

Skills follow:

```text
popiskill-<category>-<capability>-<slug>-v<major>
```

Examples:

- `popiskill-image-text2image-basic-v1`
- `popiskill-image-img2img-basic-v1`
- `popiskill-image-img2img-popistudio-alice-showcase-v1`
- `popiskill-video-image2video-basic-v1`
- `popiskill-video-image2video-popistudio-alice-showcase-v1`

## Notes

- `skills/skill-creator` is copied from the Anthropic skills repository and keeps its original `LICENSE.txt` under Apache 2.0.
- Three of the `popiskill-*` entries are minimal local test skills for validating discovery and invocation flows.
- `popiskill-image-img2img-popistudio-alice-showcase-v1` is a showcase skill derived from the PopiStudio Alice character-consistency workflow and is intended for demo, proof-frame, and creator-agent discovery scenarios.
- `popiskill-video-image2video-popistudio-alice-showcase-v1` extends the same Alice showcase direction into a short motion clip workflow for teaser shots and creator-agent demo paths.
