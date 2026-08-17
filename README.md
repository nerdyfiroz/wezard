# WeZard Whitelist Quest Platform

A production-ready whitelist quest website for the **WeZard** project. Built with a unique **Wizard × Robinhood** design identity—combining mystical dark magic aesthetics (purple/cyan particle glows, arcane runes, subtle stars) with modern fintech UI precision (emerald green CTAs, clean cards, sleek typography, micro-interactions).

> ⚠️ **Strict Content Policy**: This platform is **EXCLUSIVELY a whitelist/quest platform**. It intentionally contains **NO NFT collection showcase**, no mint prices, no galleries, and no marketplace links.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Framer Motion, Lucide React, HTML5 Canvas particle engine.
- **Backend**: Next.js Route Handlers, Zod Validation, HTTP-only secure cookie session auth.
- **Database & ORM**: PostgreSQL (Neon-ready) with **Drizzle ORM**. Features an in-memory/fallback database adapter when `DATABASE_URL` is not configured, allowing instant local evaluation.
- **Deployment**: Vercel & Neon PostgreSQL serverless compatible.

---

## 🔒 Security & Anti-Abuse

1. **Unique Account Protection**: Prevents duplicate submissions for the same EVM wallet address (`0x...`), Twitter handle (`@...`), or Discord handle.
2. **Server-Side Validation**: Enforces **100% completion of required tasks** on the server before accepting whitelist submissions. Never trusts frontend state.
3. **CAPTCHA**: Cloudflare Turnstile token verification endpoint integration.
4. **Admin Authentication**: Cookie-based HTTP-only session verification tied to `ADMIN_PASSWORD` and `ADMIN_USERNAME` environment variables.

---

## ⚡ Quick Start (Local Development)

### 1. Install Dependencies
```bash
wsl --cd /mnt/d/wezard npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
wsl --cd /mnt/d/wezard npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Admin Credentials

- **Admin Login URL**: `/admin/login`
- **Default Username**: `admin`
- **Default Password**: `wezard_admin_secret_password_2026`

*(Configure custom credentials by setting `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`)*

---

## 🐘 Neon PostgreSQL Database Setup

1. Create a free database instance on [Neon](https://neon.tech).
2. Copy your connection string (`postgres://...`).
3. Set `DATABASE_URL` in `.env`.
4. Run Drizzle database push:
   ```bash
   npm run db:push
   ```

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub / GitLab.
2. Import project in [Vercel](https://vercel.com).
3. Add the following Environment Variables in Vercel settings:
   - `DATABASE_URL`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
4. Click **Deploy**.
