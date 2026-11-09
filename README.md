# Clipper.ai v3

Clipper encuentra momentos destacados en videos que subís, los convierte en clips descargables y mantiene intacto el original. La URL de YouTube se usa solo para la vista previa; el procesamiento requiere un archivo local que tengas derecho a usar.

## Arranque local

Requisitos: Node.js 22 o superior, pnpm 10.22.0 y FFmpeg/FFprobe en `PATH` para procesar videos.

```powershell
corepack enable
corepack prepare pnpm@10.22.0 --activate
pnpm install
Copy-Item .env.example .env
# Completá OPENAI_API_KEY en .env para activar análisis y generación de clips.
pnpm dev
```

Web: <http://localhost:3000>. API: <http://localhost:4000/health>. `pnpm dev` inicia la web, la API y el worker. Los videos originales, trabajos y clips quedan en `.data/`, fuera de Git.

Sin `OPENAI_API_KEY`, el worker no envía solicitudes a la API y los trabajos muestran un error de configuración. Al agregar una clave y reiniciar, las cargas nuevas se pueden procesar. FFmpeg genera los segmentos; el análisis de voz/texto usa la API configurada.

Este almacenamiento y cola local sirven para desarrollo. Antes de recibir usuarios en producción hacen falta almacenamiento de objetos, cola compartida, autenticación y protección de costos.

## Chequeos

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm check:structure`

Consulta `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` y `docs/DATA_CONTEXT.md` antes de cambiar los límites o conceptos del producto.
