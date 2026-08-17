# WeZards Whitelist Quest Platform

A production-ready whitelist quest website for the **WeZards** project. Built with a unique **Wizard × Robinhood** design identity—combining mystical dark magic aesthetics (purple/cyan particle glows, arcane rings, subtle stars) with modern fintech UI precision (emerald green CTAs, clean cards, sleek typography, micro-interactions).

> ⚠️ **Strict Content Policy**: This platform is **EXCLUSIVELY a whitelist/quest platform**. It intentionally contains **NO NFT collection showcase**, no mint prices, no galleries, and no marketplace links.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Framer Motion, Lucide React, HTML5 Canvas particle engine.
- **Backend**: Next.js Route Handlers, Zod Validation, HTTP-only secure cookie session auth.
- **Security**: Embedded addition & multiplication **Math CAPTCHA** verification + sliding-window rate limiting.
- **Database & ORM**: PostgreSQL (Neon-ready) with **Drizzle ORM**. Features an in-memory/fallback database adapter when `DATABASE_URL` is not configured, allowing instant local evaluation.
- **Deployment**: Vercel & Neon PostgreSQL serverless compatible.

---

## ✨ Features & User Customizations

1. **Simplified Whitelist Form**: Users submit their EVM wallet address (`0x...`) and task proof details. No mandatory Discord, Telegram, or referral codes required!
2. **Points-Free Quest System**: Clear Required / Optional task indicators without point badges. Admin can configure task requirements dynamically.
3. **Simple Math CAPTCHA**: Built-in, user-friendly addition and multiplication math verification (e.g. `7 + 4 = ?` or `6 × 3 = ?`), validated server-side.
4. **Server-Side Security**: Enforces **100% completion of required tasks** on the server before accepting whitelist submissions.
5. **Admin Suite**: Cookie-based HTTP-only session verification tied to `ADMIN_PASSWORD` and `ADMIN_USERNAME` environment variables. Complete with real-time analytics, task CRUD, and CSV export.

---

## ⚡ Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Admin Credentials

- **Admin Login URL**: `/admin/login`
- **Default Username**: `admin`
- **Default Password**: `wezard_admin_secret_password_2026`

*(Configure custom credentials by setting `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`)*

---

## 🌐 Push & Deploy

```bash
git add .
git commit -m "refactor: update branding to WeZards, remove points, add Math CAPTCHA"
git push -u origin main
```
# wezards
