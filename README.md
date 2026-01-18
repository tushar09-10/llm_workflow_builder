# LLM Workflow Builder

A visual DAG workflow builder for LLM-based pipelines. Think Weavy-style UI but focused on chaining text, images, video, and AI operations.

## What it does

- Drag-and-drop visual workflow editor
- 6 node types: Text, Upload Image, Upload Video, Run LLM (Gemini), Crop Image, Extract Frame
- Type-safe connections (image only connects to image, text to text, etc.)
- Parallel execution of independent branches
- Workflow history with per-node execution details
- Save/load workflows to PostgreSQL
- Export/import as JSON

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase or Neon work great)
- Clerk account for auth
- Google Gemini API key
- (Optional) Transloadit account for file uploads
- (Optional) Trigger.dev account for background job processing

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `CLERK_SECRET_KEY` - From Clerk dashboard
- `GEMINI_API_KEY` - From Google AI Studio

Optional (will use fallbacks without these):
- `TRANSLOADIT_AUTH_KEY` / `TRANSLOADIT_AUTH_SECRET` - For production file uploads
- `TRIGGER_API_KEY` - For production background jobs

### Database

Generate Prisma client and push schema:

```bash
npm run db:generate
npm run db:push
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Sample Workflow

There's a "Marketing Kit" template in the left sidebar that loads a demo workflow with all 6 node types. It shows:
- Parallel branches (image path + video path)
- Convergence (final LLM waits for both)
- Input chaining between nodes

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── dashboard/     # Main workflow editor
│   ├── sign-in/      # Clerk auth
│   └── sign-up/
├── components/
│   ├── canvas/        # React Flow canvas
│   ├── layout/        # Sidebars, topbar
│   ├── modals/        # Load workflow modal
│   └── nodes/         # Custom node components
└── lib/
    ├── db.ts          # Prisma client
    ├── executor.ts    # Workflow execution logic
    ├── store.ts       # Zustand state
    └── types.ts       # TypeScript types
```

## Assumptions / Simplifications

- FFmpeg operations (crop, extract frame) are stubbed - in production they'd run through Trigger.dev with actual ffmpeg binaries
- File uploads use base64 data URLs in dev mode - Transloadit integration is there but needs credentials
- The UI is close to Weavy but not an exact pixel match - I focused on the general vibe
- Undo/redo stores full snapshots which isn't super efficient for large workflows

## What I'd improve for production

1. **Real FFmpeg integration** - Set up Trigger.dev tasks with ffmpeg-static for actual image/video processing
2. **Better error handling** - Right now errors just console.log, should show toasts
3. **Optimistic updates** - The save button blocks, could be smoother
4. **Undo/redo optimization** - Use operational transforms or diff-based history
5. **Canvas performance** - Large workflows might get sluggish, would need virtualization
6. **Tests** - No tests right now, would add Playwright for e2e and vitest for units
7. **Validation** - Should validate the DAG is acyclic before running

## Tech Used

- Next.js 14 (App Router)
- React Flow
- Zustand
- Prisma + PostgreSQL
- Clerk
- Tailwind CSS
- Lucide icons
- Google Gemini API
