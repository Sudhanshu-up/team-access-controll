# Team Access Control (TAC)

A simple multi-tenant team/organization access-control system — users can create organizations, invite teammates by email with a role (Owner / Admin / Member / Viewer), and manage who has access to what.

- **Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT auth
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router
- **Email:** Brevo (transactional email API)

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Running locally](#running-locally)
- [Roles & permissions](#roles--permissions)
- [API reference](#api-reference)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)

---

## Features

- **Auth** — register, login, logout, profile (JWT-based, works with or without cookies)
- **Organizations** — create, view, edit, delete (soft delete)
- **Members** — view members, change a member's role, remove a member
- **Invitations** — invite by email + role, accept, reject, cancel, resend, list pending invitations
- Role-aware UI — actions are only shown to users who are actually allowed to perform them
- Confirmation dialogs on every destructive action (delete org, remove member, leave org, reject/cancel invite)
- Loading / empty / error states everywhere — no blank screens

## Tech stack

| Layer | Tech |
|---|---|
| Backend runtime | Node.js + Express 5 |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (`jsonwebtoken`), bcrypt for password hashing |
| Validation | express-validator |
| Email | Brevo transactional email API (HTTPS) |
| Frontend framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Routing | React Router v6 |

## Project structure

```
team-access-controll/
├── backend/
│   └── src/
│       ├── controllers/     # request handlers
│       ├── services/        # business logic (the actual rules live here)
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express route definitions
│       ├── middlewares/     # auth check, validation, etc.
│       ├── validator/       # express-validator rule sets
│       ├── config/          # DB + mail config
│       ├── utils/           # sendEmail, ApiError, asyncHandler
│       └── templates/       # invitation email HTML template
└── frontend/
    └── src/
        ├── pages/            # one file per route/page
        ├── components/       # reusable UI + feature components
        ├── hooks/            # React Query hooks (one per resource)
        ├── services/         # axios calls to the backend, one per resource
        ├── context/          # AuthContext (current user, login/logout)
        ├── layouts/          # AuthLayout (login/register) and DashboardLayout (everything else)
        ├── types/            # TypeScript types matching backend responses
        └── lib/               # axios instance, error parsing, small utils
```

## Getting started

**Prerequisites:** Node.js 18+, a MongoDB connection string (e.g. free MongoDB Atlas cluster), and a Brevo account for email (see below).

```bash
git clone https://github.com/Sudhanshu-up/team-access-controll.git
cd team-access-controll
```

## Environment variables

### `backend/.env`

| Variable | Example | Notes |
|---|---|---|
| `PORT` | `2000` | Port the API listens on |
| `MONGODM_URI` | `mongodb+srv://user:pass@cluster.../TACdatabase` | ⚠️ Note the variable name really is `MONGODM_URI` (not `MONGODB_URI`) — that's what the code reads |
| `JWT_SECRET` | any long random string | Used to sign login tokens |
| `BREVO_API_KEY` | `xkeysib-...` | From Brevo → Settings → SMTP & API → API Keys |
| `MAIL_USER` | `you@gmail.com` | The **verified sender** address in Brevo — invitation emails are sent "from" this address |
| `CLIENT_URL` | `https://your-frontend.vercel.app` | Used to build the accept/reject links inside invitation emails. Must be your **deployed** frontend URL, not `localhost`, once you deploy |

> `MAIL_HOST` / `MAIL_PORT` / `MAIL_PASS` are legacy and no longer used (see [Known limitations](#known-limitations) — email now goes through Brevo's HTTPS API, not raw SMTP). They're harmless to leave in `.env` if already present.

### `frontend/.env`

| Variable | Example | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:2000` | Base URL of the backend API (no trailing slash) |

Copy `.env.example` → `.env` in both folders and fill in your own values. **Never commit `.env`.**

## Running locally

```bash
# Backend
cd backend
npm install
npm run dev        # http://localhost:2000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev         # http://localhost:5173
```

Build for production:

```bash
cd frontend
npm run build        # outputs to frontend/dist
```

## Roles & permissions

Every user has a role **per organization** (a `Membership`), not a global role.

| Role | Can view | Can invite / manage members | Can edit org | Can delete org |
|---|:---:|:---:|:---:|:---:|
| **Owner** | ✅ | ✅ (incl. granting Admin) | ✅ | ✅ |
| **Admin** | ✅ | ✅ (not Owner/other Admins) | ✅ | ❌ |
| **Member** | ✅ | ❌ | ❌ | ❌ |
| **Viewer** | ✅ | ❌ | ❌ | ❌ |

Extra rules enforced by the backend:
- No one can change or remove their own role/membership through the member-management actions.
- An Admin cannot change or remove another Admin's role — only an Owner can.
- Only an Owner can promote someone to Admin.
- Any member (except the last remaining Owner) can leave an organization voluntarily.

The frontend hides actions the current user isn't allowed to perform, but the backend is the real source of truth for all of this.

## API reference

Base paths: `/api/auth/users`, `/api/v1/org`, `/api/v1/members`, `/api/v1/invite`. All routes except register/login require `Authorization: Bearer <token>`.

**Auth**
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/users/register` | Create an account (returns a token — logs you in immediately) |
| POST | `/api/auth/users/login` | Log in (returns a token) |
| GET | `/api/auth/users/logout` | Blacklist the current token |
| GET | `/api/auth/users/profile` | Current user's info |

**Organizations**
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/org/` | Create an organization (you become Owner) |
| GET | `/api/v1/org/organizations` | List organizations you belong to (with your role in each) |
| GET | `/api/v1/org/organization/:org_id` | Organization details |
| PATCH | `/api/v1/org/updateorganization/:org_id` | Update name/description |
| DELETE | `/api/v1/org/deleteorganization/:org_id` | Soft-delete an organization |

**Members**
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/members/organization/:org_id/members` | List members of an organization |
| PATCH | `/api/v1/members/members/:membershipId/role` | Change a member's role |
| DELETE | `/api/v1/members/members/:membershipId` | Remove a member |
| POST | `/api/v1/members/organization/:org_id/leave` | Leave an organization |

**Invitations**
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/invite/organization/:org_id/invitations` | Invite someone by email + role |
| GET | `/api/v1/invite/organization/:org_id/invitations` | List pending invitations for an org |
| POST | `/api/v1/invite/accept/:token` | Accept an invitation |
| POST | `/api/v1/invite/reject/:token/invitations` | Reject an invitation |
| DELETE | `/api/v1/invite/cancel/:invitationId` | Cancel a pending invitation |
| POST | `/api/v1/invite/resend/:invitationId` | Resend an invitation email with a fresh token/expiry |

## Deployment

- **Frontend** → Vercel (or any static host). Set `VITE_API_BASE_URL` to your backend's public URL in the platform's environment variables — it's baked in at build time, so you must redeploy after changing it.
- **Backend** → Render (or Railway/similar). Set all the variables from the table above in the platform's **Environment** tab — a local `.env` file is never deployed automatically. Redeploy after changing any of them.
- **Email (Brevo)** → In Brevo, go to **Settings → Security → Authorised IP addresses** and click **"Deactivate for API keys"**. Cloud hosts like Render don't have a guaranteed static outbound IP, so leaving IP-restriction on will randomly block sends with a 401 error.

## Known limitations

A few things worth knowing about, discovered while building the frontend against this backend:

- **Errors from business-logic checks (403/404/409) come back as an HTML page, not JSON.** The backend doesn't register a JSON error-handling middleware, so thrown `ApiError`s fall through to Express's default error page. The status code is still correct — the frontend (`src/lib/errors.ts`) detects this and shows a friendly message instead of raw HTML.
- **Cookie-based auth doesn't work across a separately-hosted frontend/backend.** `cors()` runs with default options, so it can't send credentialed (cookie) requests cross-origin. The frontend instead stores the JWT returned by login/register in `localStorage` and sends it as `Authorization: Bearer <token>` — the backend's auth middleware already supports both.
- **Gmail as a sender through a third-party ESP often lands in spam.** Sending "from" a plain `@gmail.com` address via Brevo (or any ESP) frequently fails Gmail's own DMARC alignment check on the receiving end, so messages get spam-filtered even though sending succeeds. For real production use, verify a custom domain in Brevo and send from an address on that domain (e.g. `invites@yourdomain.com`) instead of a Gmail address.
- **`MONGODM_URI`** is a pre-existing typo in the codebase (should be `MONGODB_URI`), but it's what `config/db.js` actually reads — keep it as-is unless you also update the code that reads it.
