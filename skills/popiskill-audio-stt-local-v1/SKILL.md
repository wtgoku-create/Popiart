---
name: popiskill-audio-stt-local-v1
description: Transcribe speech locally with selectable Parakeet or Whisper backends. Use this when the user wants offline or local-first speech-to-text without relying on hosted APIs.
metadata: {"openclaw":{"emoji":"🎙️","requires":{"bins":["ffmpeg"]}}}
---
# PopiArt Local STT

Unified local speech-to-text using ONNX Runtime with int8 quantization. Choose your backend:

- **Parakeet** (default): Best accuracy for English, correctly captures names and filler words
- **Whisper**: Fastest inference, supports 99 languages

## Usage

```bash
# Default: Parakeet v2 (best English accuracy)
~/.openclaw/skills/popiskill-audio-stt-local-v1/scripts/local-stt.py audio.ogg

# Explicit backend selection
~/.openclaw/skills/popiskill-audio-stt-local-v1/scripts/local-stt.py audio.ogg -b whisper
~/.openclaw/skills/popiskill-audio-stt-local-v1/scripts/local-stt.py audio.ogg -b parakeet -m v3

# Quiet mode (suppress progress)
~/.openclaw/skills/popiskill-audio-stt-local-v1/scripts/local-stt.py audio.ogg --quiet
```

## Options

- `-b/--backend`: `parakeet` (default), `whisper`
- `-m/--model`: Model variant (see below)
- `--no-int8`: Disable int8 quantization
- `-q/--quiet`: Suppress progress
- `--room-id`: Matrix room ID for direct message

## Models

### Parakeet (default backend)
| Model | Description |
|-------|-------------|
| **v2** (default) | English only, best accuracy |
| v3 | Multilingual |

### Whisper
| Model | Description |
|-------|-------------|
| tiny | Fastest, lower accuracy |
| **base** (default) | Good balance |
| small | Better accuracy |
| large-v3-turbo | Best quality, slower |

## Benchmark (24s audio)

| Backend/Model | Time | RTF | Notes |
|---------------|------|-----|-------|
| Whisper Base int8 | 0.43s | 0.018x | Fastest |
| **Parakeet v2 int8** | 0.60s | 0.025x | Best accuracy |
| Parakeet v3 int8 | 0.63s | 0.026x | Multilingual |

## openclaw.json

```json
{
  "tools": {
    "media": {
      "audio": {
        "enabled": true,
        "models": [
          {
            "type": "cli",
            "command": "~/.openclaw/skills/popiskill-audio-stt-local-v1/scripts/local-stt.py",
            "args": ["--quiet", "{{MediaPath}}"],
            "timeoutSeconds": 30
          }
        ]
      }
    }
  }
}
```
