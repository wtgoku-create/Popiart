# Popiart Skillhub

Minimal PopiArt runtime skill catalog.

This working tree now keeps only the seven official runtime skills that are intended to stay usable across the current platform split:

- `popiartcli`: discovery, auth UX, `run`, jobs, and artifacts
- `popiartServer`: skill registration, execution, jobs, artifacts, stable media URLs
- `PopiNewAPI`: upstream model routing and provider access

## Layout

```text
skills/
  popiskill-image-text2image-basic-v1/
  popiskill-image-img2img-basic-v1/
  popiskill-image-img2img-popistudio-alice-showcase-v1/
  popiskill-video-image2video-basic-v1/
  popiskill-video-image2video-popistudio-alice-showcase-v1/
  popiskill-audio-tts-multimodel-v1/
  popiskill-audio-stt-local-v1/
index.json
```

Each skill directory uses the same portable structure:

```text
skills/<skill-name>/
  SKILL.md
  input_schema.json
  output_schema.json
  agents/openai.yaml
```

## Naming

Runtime skills follow:

```text
popiskill-<category>-<capability>-<slug>-v<major>
```

## Official runtime set

- `popiskill-image-text2image-basic-v1`
- `popiskill-image-img2img-basic-v1`
- `popiskill-image-img2img-popistudio-alice-showcase-v1`
- `popiskill-video-image2video-basic-v1`
- `popiskill-video-image2video-popistudio-alice-showcase-v1`
- `popiskill-audio-tts-multimodel-v1`
- `popiskill-audio-stt-local-v1`

## Notes

- This catalog intentionally drops historical `openclaw`, `infsh`, and third-party wrapper skills.
- The authoring workflow now assumes `popiskill-creator` guidance from the `popiartcli` repo, but the public runtime catalog here is limited to the seven runtime skills above.
