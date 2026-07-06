# 建設進捗プラットフォーム — Web Dashboard

Next.js 14 (App Router) dashboard for the construction progress platform.
Aligned with the backend as documented in `BACKEND_CHANGES.md` (rollback endpoint,
colour signals, layer orders, GLB upload, local file serving).

## Setup instructions

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_WS_URL=ws://localhost:8000

# 3. Start the backend first (FastAPI at :8000), then:
npm run dev
# → http://localhost:3000
```

Production: `npm run build && npm start`. Typecheck only: `npm run typecheck`.

## Role-based views

| Role | Access |
|---|---|
| admin | All pages incl. model upload, project creation |
| manager | All pages; model page is read-only; approves/rolls back reports |
| engineer | Overview, 3D viewer, reports (view only — submission is mobile) |
| client | Overview + 3D viewer only |

## Key flows

- **Reports (承認待ち / 履歴)** — pending queue with engineer% vs AI% comparison,
  confidence bar, AI flags, photo lightbox, approve with final_pct slider,
  reject, and rollback with reason (reverts the zone task and returns the
  report to pending). Rolled-back approvals render struck through.
- **Live updates** — one WebSocket per project scope (`/ws/{id}?token=`),
  auto-reconnect with exponential backoff. `progress_update` /
  `progress_rollback` / `ai_analysis_complete` invalidate the right
  TanStack Query caches and raise toasts, so the overview ring, floor chart,
  and pending badge update without reloads.
- **3D viewer** — `/dashboard/projects/[id]/viewer` embeds the backend viewer
  via the `/viewer-proxy` route handler, which fetches `GET :8000/viewer`,
  injects token/project/model keys, and auto-starts it.
- **工程管理** — template library (category-filtered, phase colour chips) +
  zone assignment with layer_order reordering and one-click standard
  sequences (structural slab / residential room / bathroom / terrace / rooftop).

## Deviations from the original spec (and why)

1. `next.config.mjs` instead of `next.config.ts` — Next 14 does not support
   TypeScript config files (that landed in Next 15). The `.ts` name breaks the build.
2. `@radix-ui/react-badge` removed from dependencies — this package does not
   exist on npm; the shadcn Badge is CVA-only and implemented locally.
3. Fonts use a local Japanese-first system stack instead of `next/font/google` —
   build-time Google Fonts fetching fails offline and behind corporate proxies.
4. The viewer proxy lives at `src/app/viewer-proxy/route.ts` (URL `/viewer-proxy`)
   to match the iframe `src` in the spec's own ViewerEmbed snippet, which pointed
   to `/viewer-proxy`, not `/api/viewer-proxy`.
