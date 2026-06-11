**Study Compass — Backend**

**Overview**
- **Description**: Backend API for the Study Compass application. Implements authentication, QA, moderation, notifications, and supporting services.

**Prerequisites**
- **Node.js**: v16+ (use nvm or similar to manage versions).
- **npm** or **yarn**: package manager used to install dependencies.
- **Database**: PostgreSQL (configured via Prisma in [backend/prisma/schema.prisma](backend/prisma/schema.prisma)).

**Quick Start**
- Install dependencies: `cd backend && npm install`
- Copy env example: `cp .env.example .env` and update values.
- Run database migrations & seed: `npx prisma migrate dev` then `node prisma/seed.ts` (or follow the scripts in [backend/package.json](backend/package.json)).
- Start dev server: `npm run dev` (uses `ts-node-dev`/`nodemon` depending on configuration).

**Environment**
- **Where**: The runtime environment variables are documented in [backend/src/config/env.ts](backend/src/config/env.ts) and an example is provided at [backend/.env.example](backend/.env.example).
- **Important**: Ensure `DATABASE_URL`, `JWT_SECRET`, and any provider keys are set before starting the app.

**Database & ORM**
- **Prisma schema**: [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- **Seeding**: [backend/prisma/seed.ts](backend/prisma/seed.ts)

**Scripts**
- **Install**: `npm install`
- **Dev**: `npm run dev` — starts the server in development mode
- **Build**: `npm run build` — transpile TypeScript to JavaScript
- **Start**: `npm start` — run the built server
- **Migrate**: `npx prisma migrate dev`

**API Documentation**
- The API surface and endpoints are documented in [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md). Refer to that file for endpoint details, expected request/response shapes, and authentication requirements.

**Project Structure (high level)**
- **Config**: [backend/src/config/env.ts](backend/src/config/env.ts) — environment loading and validation
- **Controllers**: [backend/src/controllers/](backend/src/controllers/) — request handlers
- **Services**: [backend/src/services/](backend/src/services/) — business logic and integrations
- **Routes**: [backend/src/routes/](backend/src/routes/) — express routing
- **Middleware**: [backend/src/middleware/](backend/src/middleware/) — auth, error handling, etc.

**Testing**
- No automated tests are included currently. Add tests under `backend/__tests__/` and run them with your chosen test runner (e.g. `jest`).

**Deployment**
- This backend is intended to be deployed on Railway. Configure your Railway project with the required environment variables (for example `DATABASE_URL`, `JWT_SECRET`, `HUGGINGFACE_API_KEY`, and `FRONTEND_URL`).
- See [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md) for recommended deployment steps and environment configuration for production.

**Contributing**
- Follow the repository's general contribution guidelines. Open a branch for your change, keep commits focused, and add tests where appropriate.

**Contact**
- For questions about the backend, refer to the implementer notes in [backend/IMPLEMENTATION_SUMMARY.md](backend/IMPLEMENTATION_SUMMARY.md) or open an issue.
# Study Compass Backend API

A comprehensive Node.js/Express backend for a peer advisory Q&A platform with sentiment analysis, real-time notifications, and admin moderation.

## Features

- **User Authentication**: JWT-based authentication with email verification
- **Role-Based Access Control**: Student, Advisor, Institution Rep, Admin roles
- **Q&A System**: Post questions, get matched responses from qualified advisors
- **Sentiment Analysis**: Automatic sentiment classification using HuggingFace API
- **Notifications**: Real-time notifications for matched questions, responses, upvotes
- **Advisor Verification**: Two-tier verification system for profile credibility
- **Community Moderation**: User-flagged responses with admin review
- **Filtering & Search**: Filter responses by sentiment, institution, tags

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **ML Service**: HuggingFace Inference API
- **Email**: Nodemailer (for verification and password reset)

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/study_compass
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
HUGGINGFACE_API_KEY=your_api_key
```

### 3. Database Setup

Initialize the database:

```bash
npm run prisma:generate
npm run prisma:migrate
```

(Optional) Seed with sample data:

```bash
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Express middleware
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions (JWT, errors)
│   ├── models/          # Data models
│   └── index.ts         # Express app entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
├── package.json
├── tsconfig.json
└── .env.example
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/verify-email` - Verify email address
- `POST /auth/request-password-reset` - Request password reset link
- `POST /auth/reset-password` - Reset password
- `GET /auth/me` - Get current user (protected)

### Questions & Responses

- `GET /questions` - Get all questions (paginated)
- `POST /questions` - Create new question (protected)
- `GET /questions/:id` - Get question detail with responses
- `POST /questions/:questionId/responses` - Post response (protected)
- `POST /questions/:questionId/responses/:responseId/upvote` - Upvote response (protected)

### Profiles

- `GET /profiles/student/:userId` - Get student profile
- `PUT /profiles/student` - Update student profile (protected)
- `GET /profiles/advisor/:userId` - Get advisor profile  
- `PUT /profiles/advisor` - Update advisor profile (protected)
- `POST /profiles/advisor/verify` - Submit verification (protected)
- `GET /profiles/verification-queue` - View pending verifications (admin only)
- `POST /profiles/advisor/:advisorUserId/approve-verification` - Approve verification (admin only)
- `POST /profiles/advisor/:advisorUserId/reject-verification` - Reject verification (admin only)

### Notifications

- `GET /notifications` - Get unread notifications (protected)
- `POST /notifications/:notificationId/read` - Mark as read (protected)
- `POST /notifications/read-all` - Mark all as read (protected)

### Moderation

- `POST /moderation/flag` - Flag a response (protected)
- `GET /moderation/flags` - View all flags (admin only)
- `POST /moderation/responses/:responseId/hide` - Hide response (admin only)
- `POST /moderation/responses/:responseId/unhide` - Unhide response (admin only)
- `POST /moderation/flags/:flagId/resolve` - Resolve flag (admin only)

## Database Schema

### Users Table
- Stores all user accounts with role-based access

### StudentProfile & AdvisorProfile
- Role-specific profile data
- Advisor profiles include verification status and credibility score

### Questions
- Posted questions with institution and programme context
- Tag-based matching system

### Responses
- Peer advisor responses with sentiment classification
- Upvote system and flag tracking

### Notifications
- Type-based notifications for various platform events
- Read status tracking

### Flags
- Community flagging system with admin resolution

## Authentication Flow

1. User registers with email and password
2. Verification email is sent (implement in EmailService)
3. After verification, user can login
4. JWT token is issued on successful login
5. Token is attached to subsequent requests in Authorization header
6. Routes with `authenticate` middleware verify token validity

## Sentiment Classification

Responses are automatically sent to HuggingFace multilingual sentiment API:
- Returns: POSITIVE, NEUTRAL, or NEGATIVE
- Confidence score (0-1)
- Auto-flags negative responses above confidence threshold (0.85)

## Error Handling

All errors follow a consistent JSON format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

Common status codes:
- 400: Bad Request / Validation Error
- 401: Unauthorized / Invalid Token
- 403: Forbidden / Insufficient Permissions
- 404: Not Found
- 409: Conflict / Already Exists
- 500: Server Error

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "role": "STUDENT"
  }'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "securepassword"}'

# Get questions (with token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/questions
```

## Performance Optimization

- Database indexes on frequently queried columns (tags, verification status, sentiment)
- Sentiment classification runs asynchronously (non-blocking)
- Notification queries optimized with tag matching via JOIN on indexed columns

## Future Enhancements

- Email delivery implementation (Nodemailer config)
- Full-text search for "similar questions" feature
- Advisor credibility scoring algorithm refinement
- Real-time WebSocket notifications
- Analytics & reporting dashboard
- Institution account management
- Response recommendation algorithm

## License

MIT
