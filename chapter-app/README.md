# Chapter Command — Graduate Chapter Management System

A full-stack Next.js 14 web application for managing graduate chapter membership, compliance, finances, events, and documents. Built with Supabase (PostgreSQL) as the backend.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password + magic link)
- **Styling**: CSS Modules (black & old gold theme)
- **Language**: TypeScript

---

## Setup Instructions

### 1. Prerequisites

- Node.js 18+
- A Supabase account (free tier works fine): https://supabase.com

### 2. Create your Supabase project

1. Go to https://supabase.com → New Project
2. Name it (e.g. `chapter-mgmt`), set a strong DB password, choose a region close to you
3. Wait ~2 minutes for it to provision

### 3. Run the database schema

1. In your Supabase project, go to **SQL Editor** → **New Query**
2. Open the file `chapter_db_schema.sql` (from the previous deliverable)
3. Paste the entire contents and click **Run**
4. You should see success messages for all statements

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values from **Supabase Dashboard → Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 5. Install dependencies and run

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll be redirected to the login page.

---

## Setting Up User Roles

The app has three role levels: `admin`, `officer`, and `member`.

When creating users in **Supabase Dashboard → Authentication → Users**:

1. Create a user with their email
2. After creation, click on the user → Edit → User Metadata
3. Add: `{ "chapter_role": "admin" }` for officers/admins

Or do it via SQL:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"chapter_role": "admin"}'::jsonb
WHERE email = 'officer@example.com';
```

**Role permissions:**
- `admin` — full read/write access to everything
- `officer` — read all, write most records
- `member` — read only their own data

---

## Project Structure

```
src/
├── app/
│   ├── login/             # Login page (password + magic link)
│   ├── dashboard/
│   │   ├── layout.tsx     # Sidebar + header shell (auth-protected)
│   │   ├── page.tsx       # Overview dashboard
│   │   ├── members/       # Member directory + CRUD
│   │   ├── compliance/    # Certifications + BGC tracker
│   │   ├── financial/     # Dues + Grand Tax ledger
│   │   ├── leadership/    # Exec board + committee assignments
│   │   ├── events/        # Event management + CRUD
│   │   ├── reports/       # Pre-built report views
│   │   └── documents/     # Document repository
│   ├── globals.css        # Theme variables + base styles
│   └── layout.tsx         # Root layout
├── components/
│   ├── layout/            # Sidebar, Header
│   └── ui/                # Badge, StatCard, Table, Button, Modal, etc.
├── lib/
│   ├── supabase-browser.ts  # Client-side Supabase client
│   └── supabase-server.ts   # Server-side Supabase client
├── middleware.ts           # Auth route protection
└── types/                 # TypeScript types matching DB schema
```

---

## Deployment (Vercel — recommended)

```bash
npm install -g vercel
vercel
```

When prompted, add your environment variables. Vercel + Supabase is a fully managed, zero-infrastructure setup.

---

## Next Steps / Roadmap

- [ ] Supabase Storage integration for actual file uploads in Documents
- [ ] Event attendance check-in tracking
- [ ] Meeting attendance log
- [ ] Certification renewal reminder emails (Supabase Edge Functions)
- [ ] Member self-service portal (view own profile + compliance status)
- [ ] Electronic voting module
- [ ] Event planning checklist generator
- [ ] PDF report exports

---

## Support

For Supabase docs: https://supabase.com/docs
For Next.js docs: https://nextjs.org/docs
