# Clipper.ai v3

Clipper encuentra los mejores momentos en videos y audios que ya tenés, ayuda a editarlos sin tocar el original y prepara piezas listas para compartir. También convierte fotos en videos con música, narración y movimiento.

## Arranque local

Requisitos: Node.js 22 o superior, pnpm 10.22.0 y Docker Desktop (opcional para PostgreSQL/Redis).

```powershell
corepack enable
corepack prepare pnpm@10.22.0 --activate
# Si Node no incluye Corepack: npm install --global pnpm@10.22.0
pnpm install
pnpm dev
```

Web: <http://localhost:3000>. API: <http://localhost:4000/health>. Para levantar PostgreSQL y Redis en Docker, usa `pnpm infra:up`.

La landing está en español rioplatense y en inglés (`/en`). La demo del hero usa SVG/CSS y no carga video pesado. La carga y el procesamiento reales se implementan en las fases siguientes.

## Chequeos

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm check:structure`

Consulta `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` y `docs/DATA_CONTEXT.md` antes de cambiar los límites o conceptos del producto.
