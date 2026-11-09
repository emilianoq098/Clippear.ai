# Media worker

The worker polls the local JSON job queue created by `apps/api`, extracts audio in short chunks, transcribes it, ranks shareable moments, and renders downloadable MP4 clips.

## Local requirements

- FFmpeg and FFprobe must be installed and available as `ffmpeg` and `ffprobe` (or configured with `FFMPEG_PATH` and `FFPROBE_PATH`).
- Set `OPENAI_API_KEY` in the worker environment to enable transcription and highlight ranking. Without it, jobs fail with a setup message; no API calls are made.
- The worker and API must share the same `MEDIA_STORAGE_DIR` and run on the same machine. The current JSON queue and filesystem storage are for local development, not a public multi-instance deployment.
- `OPENAI_TRANSCRIPTION_MODEL` defaults to `gpt-transcribe`; `OPENAI_SELECTION_MODEL` defaults to `gpt-6-luna`.

The worker processes only user-uploaded video files. It does not download or import video from YouTube or other social platforms.
