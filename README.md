# PeerGuide — Study Compass

A peer advisory platform that connects students with verified advisors who have attended the same institutions. Students can ask questions about university life, admissions, and programmes; advisors share real first-hand experiences; and both can follow up privately via direct messaging.

---

## Live Deployment

| Service  | URL |
|----------|-----|
| Frontend | Deployed on **Vercel** |
| Backend  | Deployed on **Railway** |
| Database | **PostgreSQL** (Railway managed) |

---

## What the App Does

- **Students** register and ask questions about institutions, programmes, and student life
- **Advisors** (current students / alumni) register, get verified, and share their experiences as structured responses
- **Sentiment classification** automatically labels each response as Positive, Neutral, or Negative using a HuggingFace NLP model, processed asynchronously via a BullMQ job queue
- **Private messaging** — after an advisor responds to a question, the student can open a private conversation to ask follow-up questions
- **Notifications** — email + in-app alerts for new responses, upvotes, matched questions, and messages
- **Moderation** — responses can be flagged; auto-flagging triggers when negative sentiment confidence is high
- **Institution pages** — browsable registry of institutions with their questions and verified advisors
- **Admin panel** — manage institutions, tags, users, and verification queue

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool and dev server |
| React Router v7 | Client-side routing |
| Tailwind CSS v3 | Utility-first styling |
| shadcn/ui + Radix UI | Accessible component primitives |
| Axios | HTTP client |
| Sonner | Toast notifications |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | HTTP server |
| TypeScript | Type safety |
| Prisma ORM | Database access and migrations |
| PostgreSQL | Primary database |
| BullMQ + Redis | Async job queue for sentiment classification |
| HuggingFace Inference API | NLP sentiment model |
| Nodemailer | Transactional email (verification, reset, notifications) |
| JWT (jsonwebtoken) | Stateless authentication |
| bcryptjs | Password hashing |
| express-rate-limit | Rate limiting |

---

## Project Structure

```
study-compass/
├── backend/                        # Express API
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema (all models)
│   │   └── seed.ts                 # Optional seed script
│   └── src/
│       ├── index.ts                # App entry point, middleware setup
│       ├── config/
│       │   └── env.ts              # Centralised environment config
│       ├── controllers/            # Route handler logic
│       │   ├── AuthController.ts
│       │   ├── AdminController.ts
│       │   ├── MessageController.ts
│       │   ├── ModerationController.ts
│       │   ├── NotificationController.ts
│       │   ├── ProfileController.ts
│       │   └── QAController.ts
│       ├── lib/
│       │   ├── prisma.ts           # Singleton Prisma client
│       │   ├── redis.ts            # Singleton ioredis client + cache helpers
│       │   └── sentimentQueue.ts   # BullMQ queue + worker definition
│       ├── middleware/
│       │   ├── auth.ts             # JWT authentication middleware
│       │   └── errorHandler.ts     # Global error + 404 handlers
│       ├── routes/                 # Express router files
│       │   ├── auth.ts
│       │   ├── admin.ts
│       │   ├── messages.ts
│       │   ├── moderation.ts
│       │   ├── notifications.ts
│       │   ├── profiles.ts
│       │   ├── public.ts           # /institutions and /tags (cached)
│       │   └── questions.ts
│       ├── services/
│       │   ├── AuthService.ts
│       │   ├── EmailService.ts
│       │   ├── NotificationService.ts
│       │   └── SentimentClassifier.ts
│       └── utils/
│           ├── errors.ts           # Custom AppError classes
│           └── jwt.ts              # Token generation / verification
│
└── frontend/                       # React SPA
    ├── public/
    ├── vercel.json                 # SPA catch-all rewrite for Vercel
    └── src/
        └── app/
            ├── App.tsx
            ├── Root.tsx
            ├── api.ts              # All Axios API calls
            ├── routes.tsx          # React Router route definitions
            ├── types.ts
            ├── components/
            │   ├── shared/         # Navbar, AvatarCircle, TagPill, etc.
            │   └── ui/             # shadcn/ui components
            ├── context/
            │   └── AppContext.tsx  # Auth state (currentUser, login, logout)
            ├── pages/
            │   ├── LandingPage.tsx
            │   ├── RegisterPage.tsx
            │   ├── LoginPage.tsx
            │   ├── VerifyEmailPage.tsx
            │   ├── ForgotPasswordPage.tsx
            │   ├── DashboardPage.tsx
            │   ├── BrowseQuestionsPage.tsx
            │   ├── QuestionThreadPage.tsx
            │   ├── AskPage.tsx
            │   ├── InstitutionPage.tsx
            │   ├── ProfilePage.tsx
            │   ├── NotificationsPage.tsx
            │   ├── MessagesPage.tsx
            │   ├── ConversationPage.tsx
            │   ├── AdminPanel.tsx
            │   ├── ForbiddenPage.tsx
            │   └── NotFoundPage.tsx
            └── styles/
```

---

## Local Development Setup

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **PostgreSQL** running locally (or a remote connection string)
- **Redis** running locally (optional — the app degrades gracefully without it; only sentiment classification is affected)

---

### 1. Clone the repository

```bash
git clone <https://github.com/Ninette03/study-compass.git>
cd study-compass
```

---

### 2. Backend setup

```bash
cd backend
```

#### Install dependencies

```bash
npm install
```

#### Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set the following:

```env
# Server
PORT=5000
NODE_ENV=development

# Database — append pool params for production
DATABASE_URL=postgresql://postgres:password@localhost:5432/study_compass

# Redis (optional for local dev)
REDIS_URL=redis://localhost:6379

# JWT — change this to a long random string
JWT_SECRET=your_super_secret_key_at_least_32_chars
JWT_EXPIRATION=7d

# Email (use a Gmail app password or SMTP provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Frontend origin (used in email links and CORS)
FRONTEND_URL=http://localhost:5173

# HuggingFace (optional — sentiment classification falls back to PENDING without it)
HUGGINGFACE_API_KEY=your_key
HUGGINGFACE_MODEL_URL=https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest
SENTIMENT_NEGATIVE_CONFIDENCE_THRESHOLD=0.85
```

#### Set up the database

```bash
# Push the schema to your local PostgreSQL database (creates all tables)
npx prisma db push

# Optional: seed with sample data
npm run prisma:seed
```

#### Start the development server

```bash
npm run dev
```

The backend runs at **http://localhost:5000**.

---

### 3. Frontend setup

```bash
cd ../frontend
```

#### Install dependencies

```bash
npm install
```

#### Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set:

```env
VITE_BACKEND_URL=http://localhost:5000
```

#### Start the development server

```bash
npm run dev
```

The frontend runs at **http://localhost:5173**.

---

## Available Scripts

### Backend (`cd backend`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload (tsx) |
| `npm run build` | Generate Prisma client + compile TypeScript |
| `npm start` | Apply DB schema + start compiled server |
| `npm run prisma:migrate` | Create a new migration from schema changes |
| `npm run prisma:studio` | Open Prisma Studio (visual DB editor) |
| `npm run prisma:seed` | Seed the database |
| `npm run type-check` | TypeScript type check without compiling |

### Frontend (`cd frontend`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |

---

## Deployment

### Backend — Railway

1. Push the repo to GitHub
2. Create a new Railway project → **Deploy from GitHub repo** → select the `backend/` folder (or set the root directory to `backend`)
3. Add a **PostgreSQL** plugin to the service — Railway injects `DATABASE_URL` automatically
4. Add a **Redis** plugin (optional) — Railway injects `REDIS_URL` automatically
5. Set the remaining environment variables in Railway → **Variables**:

```
NODE_ENV=production
JWT_SECRET=<strong random string>
FRONTEND_URL=https://your-app.vercel.app
SMTP_HOST=...
SMTP_USER=...
SMTP_PASSWORD=...
HUGGINGFACE_API_KEY=...
HUGGINGFACE_MODEL_URL=...
```

6. Railway runs `npm run build` then `npm start` automatically on each push

### Frontend — Vercel

1. Import the GitHub repo in Vercel
2. Set **Root Directory** to `frontend`
3. Framework preset: **Vite**
4. Add environment variable:

```
VITE_BACKEND_URL=https://your-backend.up.railway.app
```

5. Vercel deploys automatically on each push. The `vercel.json` in the frontend folder handles SPA routing (all paths serve `index.html`).

---

## Database Schema Overview

| Model | Description |
|-------|-------------|
| `User` | All users — students, advisors, admins |
| `StudentProfile` | Extended profile for students (education level, country, interest tags) |
| `AdvisorProfile` | Extended profile for advisors (institution, programme, verification status, credibility score) |
| `Institution` | University / institution registry |
| `Tag` | Topic tags used to match questions with advisors |
| `Question` | Questions posted by students, linked to an institution |
| `Response` | Advisor responses to questions, with sentiment classification |
| `ResponseUpvote` | Tracks which users upvoted which responses |
| `Flag` | User-submitted or auto-generated content flags |
| `Notification` | In-app notifications for all event types |
| `Conversation` | Private messaging thread between a student and an advisor on a specific question |
| `Message` | Individual message within a conversation |

---

## API Overview

All endpoints are prefixed with the Railway backend URL.

| Prefix | Description |
|--------|-------------|
| `POST /auth/register` | Register a new account |
| `POST /auth/login` | Log in, receive JWT |
| `POST /auth/verify-email` | Verify email with token from email link |
| `POST /auth/resend-verification` | Resend verification email |
| `POST /auth/request-password-reset` | Send password reset email |
| `POST /auth/reset-password` | Reset password with token |
| `GET /questions` | Browse questions (filterable) |
| `POST /questions` | Ask a new question |
| `GET /questions/:id` | Get a question with all responses |
| `POST /questions/:id/responses` | Submit a response (advisors only) |
| `POST /questions/:responseId/upvote` | Toggle upvote on a response |
| `GET /profiles/student/:userId` | Get student profile |
| `GET /profiles/advisor/:userId` | Get advisor profile |
| `PUT /profiles/student` | Update student profile |
| `PUT /profiles/advisor` | Update advisor profile |
| `GET /messages/conversations` | List all conversations for current user |
| `POST /messages/conversations` | Start a conversation with an advisor |
| `GET /messages/conversations/:id` | Get conversation + messages |
| `POST /messages/conversations/:id/messages` | Send a message |
| `GET /messages/unread-count` | Unread message count |
| `GET /notifications` | Get notifications |
| `GET /institutions` | Public list of institutions (cached) |
| `GET /tags` | Public list of tags (cached) |
| `GET /admin/*` | Admin-only endpoints |

---

## Environment Variables Reference

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWTs — must be long and random in production |
| `FRONTEND_URL` | Full URL of the frontend — used in email links |
| `REDIS_URL` | Redis connection string — needed for job queue and caching |
| `SMTP_HOST` | SMTP server host for sending emails |
| `SMTP_PORT` | SMTP port (usually 587) |
| `SMTP_USER` | SMTP username / email address |
| `SMTP_PASSWORD` | SMTP password or app password |
| `HUGGINGFACE_API_KEY` | HuggingFace API key for sentiment classification |
| `HUGGINGFACE_MODEL_URL` | Full URL to the HuggingFace inference endpoint |
| `SENTIMENT_NEGATIVE_CONFIDENCE_THRESHOLD` | Float 0–1, default `0.85` — confidence above which a response is auto-flagged |
| `PORT` | Set by Railway automatically |
| `NODE_ENV` | `development` or `production` |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | Full URL of the backend API (no trailing slash) |

Deployed app link: <https://peer-guide-two.vercel.app/> 