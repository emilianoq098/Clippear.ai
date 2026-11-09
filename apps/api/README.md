# API

Fastify API for Clipper projects, media assets, highlight analysis, editing, and publishing.

## Local video processing flow

- `POST /v1/assets` streams one MP4, MOV, or WebM video to `.data/uploads/` and creates a queued job in `.data/jobs/`.
- `GET /v1/assets/:id` returns asset metadata and the current job status.
- `GET /v1/jobs/:id` returns progress, errors, and generated clip metadata.
- `GET /v1/jobs/:id/clips/:clipId` downloads an MP4 clip after processing completes.
- Uploads are limited to 250 MiB by default; configure `MEDIA_MAX_BYTES` to change that limit.

The API listens on `127.0.0.1:4000` and allows browser requests from `http://localhost:3000` by default. Configure `WEB_ORIGIN` if your local web app uses another origin.

The JSON queue and local filesystem are development adapters. Public deployment still needs authentication, durable object storage, and a shared production queue before enabling uploads.
