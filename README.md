
# Team Access Control (TAC)

A multi-tenant team and organization access-control system built with Node.js, Express, MongoDB, React, and TypeScript.

Team Access Control (TAC) allows users to create organizations, invite teammates by email with specific roles, manage organization members, control access based on roles, and handle invitations through a production-oriented authentication and membership system.

---

## 🚀 Live Demo

🌐 **Frontend:**  
https://team-access-controll.vercel.app/login

---

## 📌 Project Overview

Team Access Control is designed around a multi-tenant organization model where a user can belong to multiple organizations and have a different role in each organization.

The core idea is:

```text
User
 │
 ├── Organization A
 │      └── Owner
 │
 ├── Organization B
 │      └── Admin
 │
 └── Organization C
        └── ViewerRoles belong to a user's membership inside an organization, rather than being global user roles.

The backend contains the actual business and authorization rules, while the frontend provides a role-aware user interface.

✨ Features
🔐 Authentication
User registration
User login
User logout
Current user profile
JWT-based authentication
JWT authentication using:
Authorization: Bearer <token>
HTTP cookies
Password hashing using bcrypt
JWT token blacklist support
Protected routes
Invalid JWT handling
Expired JWT handling
Blacklisted-token handling
Authentication error handling
Automatic unauthorized handling on the frontend
🏢 Organizations
Create organizations
View organizations
View organization details
Edit organizations
Soft-delete organizations
Organization active/inactive state
Organization ownership through memberships
Organization slug support
Organization description
👥 Membership Management
View organization members
Change member roles
Remove members
Leave organization
Owner/Admin/Member/Viewer roles
Backend authorization checks
Role-aware frontend UI
Protection against self-role modification
Protection against self-removal
Owner protection
Admin restrictions
Last-owner protection
✉️ Invitations
Invite users by email
Assign invitation roles
Accept invitations
Reject invitations
Cancel invitations
Resend invitations
Fresh token generation on resend
Invitation expiry
Pending invitation listing
Invitation email templates
Brevo transactional email integration
Invitation management UI
🎨 Frontend UX
React 19
TypeScript
Tailwind CSS
React Router
TanStack Query
React Hook Form
Zod validation
Role-aware UI
Protected routes
Loading states
Empty states
Error states
Confirmation dialogs
Toast notifications
Member management UI
Invitation management UI
Responsive dashboard interface
🧱 Architecture
Backend Architecture

The backend follows a layered architecture:

Request
   ↓
Route
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Model
   ↓
MongoDB
Responsibilities

Routes

Define API endpoints and middleware chains.

Middleware

Handle authentication, validation, 404 routes, and global error handling.

Controllers

Handle HTTP request/response concerns.

Services

Contain the main business logic and authorization rules.

Models

Define MongoDB/Mongoose schemas and database relationships.

Frontend Architecture
Page
 ↓
Component
 ↓
React Query Hook
 ↓
API Service
 ↓
Axios
 ↓
Backend API

The frontend separates UI concerns from server-state management and API communication.

🛠️ Tech Stack
Layer	Technology
Backend Runtime	Node.js
Backend Framework	Express 5
Database	MongoDB Atlas
ODM	Mongoose
Authentication	JWT
Password Hashing	bcrypt
Validation	express-validator
Email	Brevo Transactional Email API
Frontend	React 19
Language	TypeScript
Build Tool	Vite
Styling	Tailwind CSS v4
Data Fetching	TanStack Query
Routing	React Router v6
Forms	React Hook Form
Client Validation	Zod
HTTP Client	Axios
Icons	Lucide React
Notifications	React Hot Toast
📁 Project Structure
team-access-controll/
│
├── backend/
│   └── src/
│       ├── controllers/        # HTTP request handlers
│       ├── services/           # Business logic
│       ├── models/             # Mongoose schemas
│       ├── routes/             # Express routes
│       ├── middlewares/        # Auth, validation, 404, error handling
│       ├── validator/          # express-validator rules
│       ├── config/             # Database configuration
│       ├── utils/              # ApiError, asyncHandler, email utilities
│       └── templates/          # Email templates
│
└── frontend/
    └── src/
        ├── pages/              # Application pages
        ├── components/         # Reusable components
        ├── hooks/              # React Query hooks
        ├── services/           # API services
        ├── context/            # Authentication context
        ├── layouts/            # Application layouts
        ├── types/              # TypeScript types
        └── lib/                # Axios, auth storage, error parsing
👤 Roles & Permissions

Every role belongs to a user's membership within an organization.

Role	View	Invite / Manage Members	Edit Organization	Delete Organization
Owner	✅	✅	✅	✅
Admin	✅	✅	✅	❌
Member	✅	❌	❌	❌
Viewer	✅	❌	❌	❌
Additional Rules
Users cannot change their own role.
Users cannot remove themselves through member-management actions.
Owners cannot be removed.
Only Owners can assign the Admin role.
Admins cannot modify another Admin.
Admins cannot remove another Admin.
Members cannot manage other members.
Viewers cannot manage members.
The last remaining Owner cannot leave the organization without transferring ownership.
Backend authorization is the real security boundary.
Frontend role checks are only for UI/UX.
⚠️ Error Handling

The backend uses centralized error handling to provide consistent JSON responses.

Error Flow
Request
   ↓
Middleware
   ↓
Validation / Authentication
   ↓
Route
   ↓
Controller
   ↓
Service
   ↓
Database / External Service
   ↓
Error
   ↓
Global Error Handler
   ↓
Standard JSON Response
Custom ApiError

Business-logic errors use a custom ApiError.

Example:

throw new ApiError(
  403,
  "You are not allowed to remove members."
);
Standard Error Response
{
  "success": false,
  "message": "Validation failed",
  "errors": [],
  "data": null
}
Supported Error Types
Application Errors

Handled through:

ApiError
Validation Errors

express-validator errors are converted into a consistent format.

Example:

{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "org_id",
      "message": "must give the organization id"
    }
  ],
  "data": null
}
Mongoose Errors

Handled:

CastError
ValidationError
MongoDB Duplicate Key

MongoDB error code:

11000

is normalized to:

409 Conflict
JWT Errors

Handled:

Missing authentication token
Invalid JWT
Expired JWT
Blacklisted JWT
User not found for the authenticated token
External Email Service Errors

Brevo errors are normalized before reaching the frontend.

Handled cases include:

Invalid API authentication
Sender/service rejection
Rate limiting
Brevo server errors
Network/service failures
Production Error Security

The API does not expose sensitive internal information to clients.

Sensitive information includes:

JWT secrets
Bearer tokens
Brevo API keys
Internal stack traces
Raw database errors
Third-party provider internals

Unknown errors return:

{
  "success": false,
  "message": "Internal server error",
  "errors": [],
  "data": null
}

while detailed information can remain available in server-side logs.

📡 API Reference
Base Paths
/api/auth/users
/api/v1/org
/api/v1/members
/api/v1/invite

Protected routes use:

Authorization: Bearer <token>

The backend also supports cookie-based authentication.

🔑 Authentication APIs
Method	Endpoint	Description
POST	/api/auth/users/register	Create account and authenticate
POST	/api/auth/users/login	Login
GET	/api/auth/users/logout	Logout and blacklist token
GET	/api/auth/users/profile	Get current user
🏢 Organization APIs
Method	Endpoint	Description
POST	/api/v1/org/	Create organization
GET	/api/v1/org/organizations	List organizations
GET	/api/v1/org/organization/:org_id	Get organization details
PATCH	/api/v1/org/updateorganization/:org_id	Update organization
DELETE	/api/v1/org/deleteorganization/:org_id	Soft-delete organization
👥 Membership APIs
Method	Endpoint	Description
GET	/api/v1/members/organization/:org_id/members	List members
PATCH	/api/v1/members/members/:membershipId/role	Update member role
DELETE	/api/v1/members/members/:membershipId	Remove member
POST	/api/v1/members/organization/:org_id/leave	Leave organization
✉️ Invitation APIs
Method	Endpoint	Description
POST	/api/v1/invite/organization/:org_id/invitations	Send invitation
GET	/api/v1/invite/organization/:org_id/invitations	List invitations
POST	/api/v1/invite/accept/:token	Accept invitation
POST	/api/v1/invite/reject/:token/invitations	Reject invitation
DELETE	/api/v1/invite/cancel/:invitationId	Cancel invitation
POST	/api/v1/invite/resend/:invitationId	Resend invitation
⚙️ Getting Started
Prerequisites

Install:

Node.js 18+
npm
MongoDB Atlas or another MongoDB instance
Brevo account
Git

Clone the project:

git clone https://github.com/Sudhanshu-up/team-access-controll.git


cd team-access-controll
🔐 Environment Variables
Backend

Create:

backend/.env
PORT=2000


MONGODM_URI=your_mongodb_connection_string


JWT_SECRET=your_long_random_secret


BREVO_API_KEY=your_brevo_api_key


MAIL_USER=your_verified_brevo_sender


CLIENT_URL=http://localhost:5173
Variable Reference
Variable	Description
PORT	Backend server port
MONGODM_URI	MongoDB connection string
JWT_SECRET	Secret used for signing JWTs
BREVO_API_KEY	Brevo API key
MAIL_USER	Verified Brevo sender
CLIENT_URL	Frontend URL used for invitation links
Legacy SMTP variables

The following variables are no longer required:

MAIL_HOST=
MAIL_PORT=
MAIL_PASS=

Email delivery now uses the Brevo HTTPS API instead of raw SMTP.

Frontend

Create:

frontend/.env
VITE_API_BASE_URL=http://localhost:2000

For production, set this to the deployed backend URL.

Important

Never commit:

.env
.env.*

to Git.

▶️ Running Locally
Backend
cd backend


npm install


npm run dev

Backend:

http://localhost:2000
Frontend

Open another terminal:

cd frontend


npm install


npm run dev

Frontend:

http://localhost:5173
🏗️ Production Build
cd frontend


npm run build

The production build is generated in:

frontend/dist
🚀 Deployment
Frontend — Vercel

The frontend is deployed on Vercel.

Live application

https://team-access-controll.vercel.app/login

Set:

VITE_API_BASE_URL=https://your-backend-url

in Vercel Environment Variables.

Because Vite environment variables are injected during build time, redeploy the frontend after changing them.

Backend — Render

Deploy the backend as a Node.js service.

Configure the environment variables in Render:

PORT=2000


MONGODM_URI=...


JWT_SECRET=...


BREVO_API_KEY=...


MAIL_USER=...


CLIENT_URL=https://team-access-controll.vercel.app

A local .env file is never automatically deployed to Render.

📧 Email Architecture

The project originally used SMTP-based email delivery.

The current implementation uses Brevo's HTTPS API instead.

Invitation Service
       ↓
sendEmail()
       ↓
Brevo HTTPS API
       ↓
Transactional Email
       ↓
Recipient

API endpoint:

https://api.brevo.com/v3/smtp/email

HTTPS/443 is used instead of relying on outbound SMTP ports.

🔒 Security Considerations

Current security measures include:

JWT authentication
Password hashing with bcrypt
Blacklisted JWT tokens
Protected routes
Backend authorization checks
Role-based access rules
Input validation
Centralized error handling
Safe production error responses
Sensitive credential protection
Soft deletion for organizations
Membership state management
Invitation token validation
Invitation expiry

Sensitive credentials should never be committed to Git.

🧪 Current Development Status
Completed
Authentication
 Registration
 Login
 Logout
 JWT authentication
 JWT blacklist
 Profile endpoint
 Authentication middleware
 JWT error handling
Organizations
 Organization creation
 Organization listing
 Organization details
 Organization editing
 Organization soft deletion
 Organization leave flow
Memberships
 Member listing
 Role updates
 Member removal
 Leave organization
 Owner restrictions
 Admin restrictions
 Member/Viewer restrictions
Invitations
 Send invitation
 Accept invitation
 Reject invitation
 Cancel invitation
 Resend invitation
 Pending invitation listing
 Invitation email templates
 Brevo integration
Frontend
 React application
 TypeScript
 React Router
 TanStack Query
 Authentication state
 Organization UI
 Membership UI
 Invitation UI
 Loading states
 Error states
 Empty states
 Confirmation dialogs
 Toast notifications
Error Handling
 ApiError
 asyncHandler
 Global error handler
 404 handler
 Validation error handling
 Mongoose CastError handling
 Mongoose ValidationError handling
 MongoDB duplicate-key handling
 JWT error handling
 Brevo error handling
 Safe unknown-error handling
🐛 Known Limitations / Remaining Bugs
Invitation Accept Redirect

Current desired flow:

Email
  ↓
Accept Invitation
  ↓
User not logged in
  ↓
Login / Register
  ↓
Return to original invitation page
  ↓
User clicks Accept
  ↓
Dashboard

The invitation URL/context still needs to be preserved through login/register.

Invitation Reject Flow

Desired behavior:

Email
  ↓
Reject Invitation
  ↓
Token validation
  ↓
Invitation rejected

Rejecting an invitation should not require login first.

This is planned for the invitation-flow cleanup phase.

🗺️ Future Roadmap

The following features are planned but are not currently implemented.

Authorization
 Centralized RBAC / Permission system
 Permission constants
 Reusable authorization middleware
 Fine-grained resource permissions
Security
 Rate limiting
 Helmet/security headers
 Strict CORS configuration
 Login brute-force protection
 Request size limits
 Security audit
 Token/session hardening
Organization Features
 Audit logs
 Activity timeline
 Notifications
 Member search
 Member filtering
 Pagination
Invitation Improvements
 Preserve invitation route through login/register
 Direct unauthenticated invitation rejection
 Improved invitation state handling
 Invitation activity history
API
 Swagger / OpenAPI
 API versioning improvements
 Request IDs
 Structured production logging
Testing
 Jest
 Supertest
 Authentication tests
 Organization tests
 Membership tests
 Permission tests
 Invitation tests
 Error-handler tests
 Integration tests
Performance & Infrastructure
 Redis
 Redis caching
 Redis-based rate limiting
 BullMQ
 Background email jobs
 Idempotency
 Docker
 GitHub Actions CI/CD
 Production monitoring
📈 Planned Architecture

The long-term backend architecture is planned around:

                    Client
                      │
                      ▼
                 Express API
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   Validation       Auth        Rate Limit
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
                   Routes
                      │
                      ▼
                 Controllers
                      │
                      ▼
                  Services
                      │
          ┌───────────┼───────────┐
          │           │           │
       MongoDB      Redis       Queue
          │                       │
          │                     BullMQ
          │                       │
          └───────────┬───────────┘
                      │
                      ▼
                 External APIs
                    Brevo

This architecture will be introduced incrementally as the application grows.

📚 Development Philosophy

The project follows separation of concerns.

Backend
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Services
  ↓
Models
  ↓
Database

Business rules primarily live inside services instead of controllers.

Frontend
Pages
  ↓
Components
  ↓
React Query Hooks
  ↓
API Services
  ↓
Axios
  ↓
Backend

This keeps UI, API communication, and server state separated.

🔍 Important Design Decisions
Backend is the security boundary

Frontend role checks exist for better UX:

Hide Edit button
Hide Delete button
Hide Invite button

But they are not trusted for security.

The backend independently verifies:

User
 ↓
Membership
 ↓
Organization
 ↓
Role
 ↓
Permission

before performing protected operations.

Soft Delete

Organizations and memberships use state-based deletion instead of immediately removing database records.

This makes it possible to retain useful historical information and avoid unnecessary destructive database operations.

Token Blacklisting

JWTs are normally stateless, but logout requires the application to invalidate the token before its natural expiry.

The project therefore stores blacklisted tokens and checks them during authentication.

📄 License

This project is currently a personal learning and portfolio project.

👨‍💻 Author

Sudhanshu Chaudhari

GitHub:

https://github.com/Sudhanshu-up

LinkedIn:

https://www.linkedin.com/in/sudhanshu-chaudhari-3872b7339



### Ek cheez aur


README me maine **Backend ka fake/live URL nahi dala**, kyunki tumne specifically bola tha sirf Vercel link dena. Isliye live demo:


**https://team-access-controll.vercel.app/login**


hi rakha hai.


Aur jo cheezein abhi bani nahi hain—RBAC abstraction, Redis, BullMQ, Jest, Swagger, Docker etc
