# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: None (CSV file-based lead storage)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   │   ├── data/           # JSON data files + leads.csv
│   │   └── src/routes/     # API routes (health, leads, data)
│   └── nextstoprussia/     # React + Vite frontend
│       ├── public/images/  # AI-generated hero, doctor, logo images
│       └── src/
│           ├── components/
│           │   ├── layout/   # Navbar, Footer
│           │   └── sections/ # Hero, About, Services, Universities, Fees, Process, Gallery, Testimonials, Contact
│           └── pages/        # Home.tsx
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection (unused)
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Project: NextStopRussia

**NextStopRussia** is a professional education consultancy website for **Dr. Jabroot Khatib**, an MBBS doctor from Moscow who helps international students secure admissions to Russian universities.

### Website Sections
1. Hero — Russian university background, tagline, CTA buttons (Apply, WhatsApp, Telegram)
2. About — Dr. Jabroot Khatib biography and mission
3. Services — 8 service cards loaded from `/api/data/services`
4. Universities — Partner universities loaded from `/api/data/universities`
5. Fees — University fees table + consultancy pricing cards + cost estimator calculator
6. Admission Process — 6-step timeline
7. Gallery — Images and YouTube videos loaded from `/api/data/gallery`
8. Testimonials — Student success stories loaded from `/api/data/testimonials`
9. Lead Form — Captures leads, saves to CSV, sends Telegram notification
10. Contact — WhatsApp, Telegram, email, office location, Google Maps
11. Footer — Quick links, social media, copyright

### Backend API Endpoints
- `GET /api/healthz` — Health check
- `POST /api/submit-lead` — Save lead to CSV + notify Telegram
- `GET /api/data/services` — Services data
- `GET /api/data/universities` — Universities data
- `GET /api/data/university-fees` — University fees data
- `GET /api/data/consultancy-fees` — Consultancy fees data
- `GET /api/data/testimonials` — Testimonials data
- `GET /api/data/gallery` — Gallery data

### Environment Variables
- `TELEGRAM_BOT_TOKEN` — Telegram bot token for notifications
- `TELEGRAM_CHAT_ID` — Telegram chat ID for notifications
- `WHATSAPP_NUMBER` — WhatsApp number (e.g. 79001234567)

### Data Files (artifacts/api-server/data/)
- `leads.csv` — Lead submissions (appended on each form submit)
- `services.json` — 8 services
- `universities.json` — 8 partner universities
- `universityFees.json` — Fee breakdown per university/course
- `consultancyFees.json` — Consultancy service pricing
- `testimonials.json` — 6 student testimonials
- `gallery.json` — Campus/student life photos + YouTube videos

### Deployment
See `artifacts/nextstoprussia/DEPLOYMENT.md` for full AWS EC2 deployment guide including NGINX, PM2, and Let's Encrypt SSL setup.

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
