# Clipper.ai v3 — guía de trabajo

## Mapa del monorepo
- `apps/web`: landing, workspaces y editor web con Next.js App Router.
- `apps/api`: Fastify, contratos HTTP, auth, proyectos, jobs y OpenAPI.
- `apps/worker`: colas, FFmpeg, proxies y render de exportación.
- `apps/ml-worker`: workers Python para transcripción, señales y visión.
- `apps/mcp-server`: herramientas y recursos MCP autenticados.
- `packages/shared`: esquemas Zod y contratos versionados.
- `packages/providers`: interfaces, registro de capacidades y mocks externos.
- `packages/highlight-engine`: candidatos, puntajes, ranking y diversidad.
- `packages/editor-core`: EDL versionada, operaciones y validación de timeline.
- `packages/ui`: tokens de marca y componentes accesibles.
- `packages/sdk`: cliente TypeScript tipado.
- `docs/`: arquitectura, decisiones y contexto de datos.

## Convenciones de trabajo
- pnpm + Turborepo; TypeScript estricto en apps y paquetes Node.
- Validar HTTP, colas, WebSocket y MCP con Zod; contratos Python son JSON versionado.
- Los archivos originales no se modifican. Toda edición es una EDL versionada.
- Proveedores externos detrás de interfaces; desarrollo sin claves con mocks funcionales.
- Modelos, capacidades, límites y costos viven en un registro configurable.
- No descargar ni scrapear contenido de redes; usar archivos, enlaces directos a archivos u OAuth oficial.
- Derechos del contenido antes del procesamiento; consentimiento explícito para clonar voz.
- Soportar español con voseo e inglés; estados vacíos, carga, error, éxito y sin créditos.
- Reducir movimiento con `prefers-reduced-motion`; conservar accesibilidad de teclado y contraste.
- Cerrar cada fase con tests, README, supuestos y actualización de tareas/memoria.

## Roles y checklist de aceptación
- **Arquitectura:** límites descritos en Mermaid; ADRs y contratos compatibles actualizados.
- **Backend:** autorización por workspace; Zod; idempotencia; trabajos reanudables; ledger auditable.
- **Frontend/UX:** estados de pantalla y atajos; teclado; mobile; español/inglés; movimiento reducido.
- **Media/ML:** original preservado; timestamps alineados; segmentos no cortan palabras; temporales limitados.
- **Datos:** RLS; UTC; joins y agregados verificados; métricas definidas antes de publicar.
- **QA/Seguridad:** derechos declarados; secretos backend; límites/escaneo de uploads; casos de fallo cubiertos.

## Comandos
- `pnpm dev`: web, API y workers locales.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`: chequeos del monorepo.
- `pnpm infra:up`: PostgreSQL y Redis locales con Docker Compose.
