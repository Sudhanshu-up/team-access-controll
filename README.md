# Team Access Control (TAC)

A multi-tenant team and organization access-control system built with Node.js, Express, MongoDB, React, and TypeScript.

Users can create organizations, invite teammates by email with specific roles, manage members, control permissions, and handle organization access through a production-oriented authentication and membership system.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Running locally](#running-locally)
- [Roles & permissions](#roles--permissions)
- [Error handling](#error-handling)
- [API reference](#api-reference)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [Recent development](#recent-development)
- [Future improvements](#future-improvements)

---

## Features

### Authentication

- User registration
- User login
- User logout
- Current user profile
- JWT-based authentication
- JWT authentication through:
  - `Authorization: Bearer <token>`
  - HTTP cookie
- Password hashing with bcrypt
- Token blacklist support for logout
- Protected API routes
- Authentication error handling
- Expired and invalid JWT handling

### Organizations

- Create organizations
- View organizations
- View organization details
- Edit organization
- Soft-delete organizations
- Organization active/inactive state
- Organization ownership through memberships

### Membership management

- View organization members
- Assign member roles
- Remove members
- Leave organization
- Owner/Admin/Member/Viewer role system
- Backend-enforced membership permissions
- Protection against self-role modification
- Protection against self-removal
- Owner protection
- Admin restrictions
- Last-owner protection

### Invitations

- Invite users by email
- Assign invitation role
- Accept invitations
- Reject invitations
- Cancel pending invitations
- Resend invitations
- Fresh token generation on resend
- Invitation expiry
- Pending invitation listing
- Invitation email templates
- Brevo transactional email integration

### Frontend UX

- Role-aware UI
- Protected routes
- Loading states
- Empty states
- Error states
- Confirmation dialogs
- Toast notifications
- Member management UI
- Invitation management UI
- Responsive dashboard UI
- React Query based server-state management

### Error handling

- Centralized API error handling
- Consistent JSON error responses
- Custom `ApiError`
- Global Express error middleware
- 404 API route handling
- Request validation error handling
- Mongoose error handling
- MongoDB duplicate-key handling
- JWT error handling
- External email-service error handling
- Safe production error responses
- Internal error details are not exposed to clients

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js |
| Backend framework | Express 5 |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT |
| Password hashing | bcrypt |
| Validation | express-validator |
| Email | Brevo Transactional Email API |
| Frontend | React 19 |
| Language | TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack Query |
| Routing | React Router v6 |
| Forms | React Hook Form |
| Client validation | Zod |
| HTTP client | Axios |
| Icons | Lucide React |
| Notifications | React Hot Toast |

---

## Project structure

```text
team-access-controll/
│
├── backend/
│   └── src/
│       ├── controllers/        # HTTP request handlers
│       ├── services/           # Business logic and access-control rules
│       ├── models/             # Mongoose schemas
│       ├── routes/             # Express route definitions
│       ├── middlewares/        # Auth, validation, 404, global error handling
│       ├── validator/          # express-validator rule sets
│       ├── config/             # Database configuration
│       ├── utils/              # ApiError, asyncHandler, email utilities
│       └── templates/          # Transactional email templates
│
└── frontend/
    └── src/
        ├── pages/              # Application pages/routes
        ├── components/         # Reusable UI components
        ├── hooks/              # React Query hooks
        ├── services/           # API service functions
        ├── context/            # Authentication context
        ├── layouts/            # Auth and dashboard layouts
        ├── types/              # TypeScript types
        └── lib/                # Axios, auth storage, error parsing, utilities
