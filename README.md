# Team Access Control (TAC)

A multi-tenant team/organization access-control system. Users register
once and can then belong to multiple organizations, holding a different
role — `owner`, `admin`, `member`, or `viewer` — in each one. Authorization
is enforced entirely on the backend, per-organization, based on the
caller's membership role.

**Live demo:** https://team-access-controll.vercel.app/login
**Backend API:** https://team-access-controll-2.onrender.com *(Render free tier — first request after inactivity may be slow)*
**Repository:** https://github.com/Sudhanshu-up/team-access-controll

> 📚 This README is intentionally short. The full, code-verified
> documentation — architecture, every API endpoint, the permission matrix,
> a security audit, and a list of every place the code disagrees with
> earlier documentation — lives in [`docs/`](./docs/README.md).

## Features

**Authentication** — register, login, logout, current-user profile.
JWT-based, via `Authorization: Bearer <token>` or an httpOnly cookie
(the deployed frontend uses the header; see [docs/authentication.md](./docs/authentication.md)
for why). Logged-out tokens are blacklisted server-side until they'd have
expired anyway.

**Organizations** — create, list, view, edit, and soft-delete. Each
organization gets a unique, URL-safe `slug` derived from its name.

**Memberships** — list members, change a member's role, remove a member,
leave an organization. Rules enforced on the backend: nobody can change or
remove their own role, an owner can't be demoted or removed, only an owner
can promote someone to admin, an admin can't touch another admin, and the
last remaining owner can't leave. Full matrix: [docs/authorization.md](./docs/authorization.md).

**Invitations** — invite by email with an assigned role, accept, reject,
cancel, resend (issues a fresh token/expiry). Invitations expire 24 hours
after being sent. Delivered via Brevo's transactional email API. Full
lifecycle: [docs/invitations.md](./docs/invitations.md).

## Architecture

```
React (Vite/TypeScript) → axios → Express 5 → Middleware → Controllers → Services → Mongoose → MongoDB
```

Business logic and every authorization check live in the **service**
layer. There is currently **no centralized RBAC system** — each service
function repeats its own role checks inline. Diagrams and the full request
lifecycle: [docs/architecture.md](./docs/architecture.md).

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express 5, Mongoose, `express-validator`, `jsonwebtoken`, `bcrypt` |
| Email | Brevo transactional email HTTPS API |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui |
| Server state | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| HTTP client | Axios |
| Database | MongoDB |

## Project structure

```
team-access-controll/
├── backend/
│   └── src/
│       ├── controllers/    # HTTP request/response shaping
│       ├── services/       # Business logic + authorization
│       ├── models/         # Mongoose schemas
│       ├── routes/         # Express routers
│       ├── middlewares/    # authUser, validate, 404, global error handler
│       ├── validator/      # express-validator chains
│       ├── config/         # DB connection, (legacy) SMTP config
│       ├── utils/          # ApiError, asyncHandler, sendEmail
│       └── templates/      # Invitation email HTML
├── frontend/
│   └── src/
│       ├── pages/          # One file per route
│       ├── components/     # ui/, common/, organization/
│       ├── hooks/          # TanStack Query wrappers
│       ├── services/       # One function per backend endpoint
│       ├── context/        # AuthContext
│       ├── layouts/        # AuthLayout, DashboardLayout
│       ├── types/          # Shared TS types
│       └── lib/            # axios instance, auth storage, error parsing
└── docs/                    # Full documentation (start at docs/README.md)
```

## Roles & permissions

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| View organization / members | ✅ | ✅ | ✅ | ✅ |
| Invite / manage members | ✅ | ✅ | ❌ | ❌ |
| Edit organization | ✅ | ✅ | ❌ | ❌ |
| Delete organization | ✅ | ❌ | ❌ | ❌ |
| Grant admin role | ✅ | ❌ | ❌ | ❌ |

Full matrix with every edge case (self-modification, admin-vs-admin,
last-owner protection): [docs/authorization.md](./docs/authorization.md).
Backend authorization is the real security boundary — frontend role checks
only control what's shown in the UI.

## API overview

19 endpoints across 4 groups: Authentication (`/api/auth/users`),
Organizations, Memberships, Invitations (all under `/api/v1/...`). Every
endpoint — method, auth requirement, required role, body, and response
shape — is documented in [docs/api-reference.md](./docs/api-reference.md).

## Local setup

```bash
# Backend
cd backend
npm install
npm run dev            # http://localhost:2000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

Full walkthrough: [docs/development.md](./docs/development.md).

## Deployment

| Service | URL |
|---|---|
| Frontend | https://team-access-controll.vercel.app/login |
| Backend API | https://team-access-controll-2.onrender.com |

Full deployment guide: [docs/deployment.md](./docs/deployment.md).

## Current status

Core auth, organizations, memberships, and invitations are implemented
end-to-end on both backend and frontend. **No automated tests exist yet**,
and there is **no centralized RBAC** — every permission check is written
inline per service function. See [docs/testing.md](./docs/testing.md) and
[docs/roadmap.md](./docs/roadmap.md).

## Known limitations

- Two response shapes coexist: most endpoints return
  `{success, message, errors, data}`; `register`/`login` return a
  different shape on validation/auth failure.
- Rejecting an invitation still requires the recipient to be logged in.
- No rate limiting; CORS currently allows any origin.

Full list, plus a security audit with severity ratings, in
[docs/security.md](./docs/security.md) and
[docs/README.md](./docs/README.md#known-issues--documentation-discrepancies).

## Documentation

| Doc | Contents |
|---|---|
| [docs/README.md](./docs/README.md) | Documentation index + discrepancy log |
| [docs/architecture.md](./docs/architecture.md) | System architecture, diagrams, lifecycles |
| [docs/backend.md](./docs/backend.md) | Backend layer-by-layer |
| [docs/frontend.md](./docs/frontend.md) | Frontend architecture, data flow |
| [docs/authentication.md](./docs/authentication.md) | JWT, cookies, blacklist |
| [docs/authorization.md](./docs/authorization.md) | Full permission matrix |
| [docs/organizations.md](./docs/organizations.md) | Organization CRUD |
| [docs/memberships.md](./docs/memberships.md) | Membership rules |
| [docs/invitations.md](./docs/invitations.md) | Invitation lifecycle |
| [docs/email.md](./docs/email.md) | Brevo integration |
| [docs/error-handling.md](./docs/error-handling.md) | Error pipeline |
| [docs/database.md](./docs/database.md) | Every Mongoose model |
| [docs/api-reference.md](./docs/api-reference.md) | Every endpoint |
| [docs/deployment.md](./docs/deployment.md) | Vercel + Render + Atlas + Brevo |
| [docs/environment.md](./docs/environment.md) | Every env variable |
| [docs/security.md](./docs/security.md) | Security audit |
| [docs/testing.md](./docs/testing.md) | Current + recommended tests |
| [docs/troubleshooting.md](./docs/troubleshooting.md) | Problem → cause → fix |
| [docs/development.md](./docs/development.md) | Day-to-day dev guide |
| [docs/roadmap.md](./docs/roadmap.md) | Prioritized future work |
| [docs/changelog.md](./docs/changelog.md) | History from git log |

## Author

**Sudhanshu Chaudhari**
GitHub: [@Sudhanshu-up](https://github.com/Sudhanshu-up)
LinkedIn: [sudhanshu-chaudhari](https://www.linkedin.com/in/sudhanshu-chaudhari-3872b7339)
