# Decisiones de arquitectura

## ADR-001 — Clipper procesa medios aportados por el usuario

- **Estado:** aceptada.
- **Decisión:** v3 es una herramienta para encontrar, editar y publicar videos y audios existentes, más foto → video.
- **Motivo:** el producto no genera clips a partir de prompts de video; prompts anteriores quedan reemplazados.

## ADR-002 — Monorepo y límites de ejecución

- **Estado:** aceptada.
- **Decisión:** pnpm/Turborepo organiza Next.js web, Fastify API, worker Node, worker ML Python y MCP server.
- **Motivo:** separar interacción, control de jobs, cómputo multimodal y edición/render.

## ADR-003 — Edición no destructiva con EDL

- **Estado:** aceptada.
- **Decisión:** conservar originales inmutables; guardar cortes y ajustes como EDL JSON versionado; exportar un nuevo asset.
- **Motivo:** permitir undo/redo, autosave y revisión sin perder el material fuente.

## ADR-004 — Proveedores intercambiables y registro configurable

- **Estado:** aceptada.
- **Decisión:** STT, voz, LLM, visión, música y publicación usan interfaces con Mock. Modelos/capacidades/límites/costos viven en un registro configurable.
- **Motivo:** desarrollar y probar sin credenciales, y cambiar proveedores sin reescribir el dominio.

## ADR-005 — Integración con plataformas

- **Estado:** aceptada.
- **Decisión:** no descargar ni scrapear videos de redes sociales. Admitir archivos, URLs directas a archivos y operaciones permitidas por APIs oficiales con OAuth del usuario.
- **Motivo:** respetar términos de plataforma y permisos del propietario.

## ADR-006 — UX de portada y movimiento

- **Estado:** aceptada para Fase 0.
- **Decisión:** español rioplatense como ruta raíz, inglés en `/en`; Bricolage Grotesque + Instrument Serif + Inter + JetBrains Mono; paleta tinta/violeta/rosa.
- **Motivo:** una voz propia ligada a clips y edición, con movimiento breve, reducido si el sistema lo solicita.
- **Supuesto:** `clipper.ai` es el dominio público de producción; `NEXT_PUBLIC_SITE_URL` puede definir el dominio final.

## Supuestos pendientes

- La conexión de ElevenLabs y otros proveedores se diseñará con BYOK cifrado, pero no se requiere clave para Fase 0.
- Los montos definitivos de planes todavía no están definidos; la landing describe cobro por uso sin inventar precios.
