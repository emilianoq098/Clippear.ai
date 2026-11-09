# Contexto de stack — Clipper.ai v3

- Monorepo: pnpm workspaces + Turborepo.
- Web: Next.js App Router + React + TypeScript; tipografía autoalojada con `next/font`.
- API: Fastify + Zod + OpenAPI; eventos WebSocket/SSE.
- Workers: Node/FFmpeg para media y Python para análisis ML; contratos JSON versionados.
- Datos: PostgreSQL + pgvector, Redis y almacenamiento S3-compatible.
- UI y edición: `packages/ui` concentra tokens; `packages/editor-core` define EDL no destructiva.
- Proveedores: interfaces y Mock adapters; modelo/capacidades/costo en registro configurable.
- Infra local: Docker Compose opcional para PostgreSQL y Redis.
- Calidad: GitHub Actions; lint, typecheck, tests y build.
