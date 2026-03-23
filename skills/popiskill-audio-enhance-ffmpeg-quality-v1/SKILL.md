---
name: popiskill-audio-enhance-ffmpeg-quality-v1
description: Improve audio quality with FFmpeg cleanup and enhancement presets. Use this when the user wants practical defaults for denoise, artifact cleanup, or audio-quality restoration in media files.
---
## Defaults (Stronger, Still Safe)

### Video (quality)
`-vf "nlmeans=s=4:p=7:r=15"`

### Video (fast)
`-vf "hqdn3d=5:4:8:6"`

### Video (temporal)
`-vf "atadenoise=s=9:p=7"`

### Video (GPU)
`-vf "hwupload,nlmeans_opencl=s=4:p=7:r=15,hwdownload,format=yuv420p"`

### Audio (general)
`-af "afftdn=nf=-28:nr=14"`

### Audio (speech)
`-af "anlmdn=s=0.0002:p=0.01"`

## Quick Use

### Stronger video cleanup
```bash
ffmpeg -i noisy.mp4 -vf "nlmeans=s=4:p=7:r=15" -c:v libx264 -crf 18 output.mp4
```

### Fast video cleanup
```bash
ffmpeg -i noisy.mp4 -vf "hqdn3d=5:4:8:6" -c:v libx264 -crf 18 output.mp4
```

### GPU video cleanup
```bash
ffmpeg -i noisy.mp4 -vf "hwupload,nlmeans_opencl=s=4:p=7:r=15,hwdownload,format=yuv420p" -c:v libx264 -crf 18 output.mp4
```

### Audio cleanup
```bash
ffmpeg -i noisy_audio.mp4 -af "afftdn=nf=-28:nr=14" -c:a aac -b:a 192k output.mp4
```

## Tuning (Minimal)

- `nlmeans`: raise `s` for more reduction (3-6 typical); reduce `p` to preserve detail.
- `hqdn3d`: increase first two values for stronger spatial denoise; last two for temporal.
- `afftdn`: lower `nf` (more negative) to be more aggressive; raise `nr` for stronger reduction.

## When to Apply

- Noisy low-light footage
- Grainy film scans
- Compressed/streamed artifacts
- Room tone or steady hiss
