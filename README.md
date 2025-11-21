# TinyLink - Starter Project

Simple URL shortener starter (Express + Postgres + Tailwind).

## Quick start

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install deps:
   ```bash
   npm install
   ```
3. Build Tailwind output.css (in one terminal):
   ```bash
   npx tailwindcss -i ./public/styles.css -o ./public/output.css --watch
   ```
4. Start server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000

## Notes
- Run SQL in `sql/schema.sql` to create the `links` table.
- API endpoints:
  - `POST /api/links`
  - `GET /api/links`
  - `GET /api/links/:code`
  - `DELETE /api/links/:code`
  - `GET /healthz`
- Redirects: `GET /:code` returns 302 to target and increments clicks.
