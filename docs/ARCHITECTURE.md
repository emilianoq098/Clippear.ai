# Arquitectura de Clipper.ai v3

Clipper procesa material aportado por el usuario para encontrar momentos compartibles, editar audio/video y publicar exportaciones. Los originales permanecen inmutables. Los cortes, subtítulos, capas y transformaciones viven en una EDL versionada y se renderizan como nuevos assets.

## Contexto del sistema

```mermaid
flowchart LR
  Creator[Creator / Team] --> Web[Clipper Web]
  Web --> API[Clipper API]
  API --> Upload[Resumable Upload]
  Upload --> Store[(Originals + Proxies)]
  API --> Queue[(Durable Jobs)]
  Queue --> Worker[Media Worker]
  Queue --> ML[ML Workers]
  ML --> STT[STT / Vision / LLM Interfaces]
  Worker --> FFmpeg[FFmpeg Render]
  FFmpeg --> Store
  API --> DB[(PostgreSQL + pgvector)]
  UserProvider[User's OAuth / BYOK] --> API
  API --> Publish[Official Publishing APIs]
  Agent[AI Client] --> MCP[MCP Server]
  MCP --> API
```

## Contenedores y paquetes

```mermaid
flowchart TB
  subgraph Apps[Aplicaciones]
    Web[apps/web<br/>Next.js App Router]
    API[apps/api<br/>Fastify + Zod + OpenAPI]
    Worker[apps/worker<br/>Queues + FFmpeg]
    ML[apps/ml-worker<br/>Python + versioned JSON contracts]
    MCP[apps/mcp-server<br/>Streamable tools]
  end
  subgraph Packages[Paquetes compartidos]
    Shared[packages/shared]
    Providers[packages/providers<br/>Interfaces + Mock adapters]
    Highlights[packages/highlight-engine]
    Editor[packages/editor-core<br/>EDL]
    UI[packages/ui]
    SDK[packages/sdk]
  end
  DB[(PostgreSQL / pgvector)]
  Redis[(Redis)]
  S3[(S3-compatible storage)]
  Web --> API
  Web --> UI
  API --> Shared
  API --> Highlights
  API --> Providers
  API --> DB
  API --> Redis
  API --> S3
  API --> Editor
  MCP --> API
  Worker --> Redis
  Worker --> Editor
  Worker --> S3
  ML --> Redis
  ML --> DB
  SDK --> API
```

## Pipeline de highlights

```mermaid
sequenceDiagram
  participant U as User
  participant A as API
  participant Q as Job Queue
  participant W as Media Worker
  participant M as ML Workers
  participant P as Provider Registry
  participant D as PostgreSQL / Storage
  U->>A: Upload asset + rights declaration
  A->>A: Validate type, size, ownership, estimate cost
  A->>Q: Create resumable highlight_run
  Q->>W: Proxy 720p + extract audio/keyframes
  W->>D: Store immutable original and derived proxy
  W->>M: Dispatch timestamped analysis tasks
  M->>P: Call STT / vision / LLM interface
  P-->>M: Mock or configured provider result
  M->>D: Persist words, speakers, signals and embeddings
  M->>M: Build boundaries, score, diversify, explain
  M->>D: Save clips; never split word or sentence boundaries
  D-->>U: Progress events and ranked results
```

Each score is a heuristic with component breakdown and one-sentence reason. It does not imply a promise of virality. Provider/model choices and their capabilities, limits, and costs come from configuration, not UI constants.

## Pipeline de render y EDL

```mermaid
flowchart LR
  Edits[User edits] --> Validate[Validate versioned EDL]
  Validate --> Estimate[Estimate credits + confirm]
  Estimate --> Reserve[Reserve ledger credits]
  Reserve --> Preview[Browser preview from proxies]
  Preview --> Queue[Idempotent render job]
  Queue --> FFmpeg[FFmpeg: scale, mix, captions, overlays]
  FFmpeg --> Verify[Probe duration, codecs, aspect, audio]
  Verify --> Output[New immutable export asset]
  Output --> Commit[Commit usage]
  FFmpeg -->|failure/cancel| Refund[Refund reservation]
```

The EDL stores track order, source asset, in/out time, timeline position, transforms, gain and caption styling. Undo/redo and autosave append versions. The renderer reads source media and emits a separate output; it never rewrites the source.

## Data model draft

```mermaid
erDiagram
  USERS ||--o{ MEMBERSHIPS : joins
  WORKSPACES ||--o{ MEMBERSHIPS : includes
  WORKSPACES ||--o{ PROJECTS : owns
  PROJECTS ||--o{ ASSETS : contains
  ASSETS ||--o{ ASSET_VERSIONS : derives
  ASSETS ||--o{ TRANSCRIPTS : transcribed_as
  TRANSCRIPTS ||--o{ TRANSCRIPT_WORDS : contains
  ASSETS ||--o{ SIGNALS : analyzed_as
  PROJECTS ||--o{ HIGHLIGHT_RUNS : analyzes
  HIGHLIGHT_RUNS ||--o{ CLIPS : proposes
  CLIPS ||--o{ CLIP_SCORES : scored_as
  CLIPS ||--o{ CLIP_FEEDBACK : receives
  PROJECTS ||--o{ TIMELINES : edits
  TIMELINES ||--o{ RENDERS : exports
  WORKSPACES ||--o{ JOBS : queues
  JOBS ||--o{ JOB_EVENTS : emits
  WORKSPACES ||--o{ CREDIT_LEDGER : tracks
  WORKSPACES ||--o{ RIGHTS_DECLARATIONS : authorizes
```

Use PostgreSQL for transactional state, pgvector for semantic retrieval, Redis for queue coordination, and S3-compatible storage for originals, proxies, and immutable export assets. Partition high-volume jobs/events/ledger by month when volume justifies it.

## Operational boundaries

- External STT, voice, LLM, vision, music and publishing services implement typed provider interfaces and have a functional Mock adapter.
- Long workflows support idempotency, retries, resume and dead-letter handling.
- Rights declarations precede processing; signed URLs expire; uploads have size/type limits and scanning.
- Never scrape or download from social networks; use direct file URLs and official user-authorized OAuth APIs.
- Persist timestamps in UTC. Keep provider keys encrypted and backend-only.
