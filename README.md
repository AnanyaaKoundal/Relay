# Relay

A full-stack video learning platform built with Next.js, Express, PostgreSQL, and TypeScript. Supports three roles (learners, instructors, administrators) with a video processing pipeline that transcodes uploads into adaptive HLS streams.

## 🎯 Features

### Learners
- Browse and search courses with filters (category, difficulty, price)
- Enroll in free courses or purchase with mock payment flow
- Auto-applied coupons with transparent discount breakdown
- Tax-aware checkout with IP-based country detection
- Custom video player with HLS adaptive streaming, quality selector, playback speed, and keyboard shortcuts
- Server-side quiz evaluation with unlimited retries and best-score tracking
- Course progress tracking with completion status
- Profile management with avatar upload (circle crop, multi-size)

### Instructors
- Course builder with chapter/lesson CRUD, draft/publish workflow, and batch publishing
- Video upload with presigned S3 URLs, progress tracking, and automatic transcoding
- Overview dashboard with revenue, enrollment, and completion KPIs
- Course analytics with enrollment funnels, lesson completion rates, country distribution, and coupon usage
- Earnings dashboard with gross/net breakdown, revenue trends, and transaction history
- Profile editor with live preview

### Administrators
- Separate admin panel with role-based access where admin never sees the learner site
- Dashboard with platform-wide KPIs, revenue trends, geographic distribution, and top instructors/courses
- User management with search, role assignment, ban/unban, and detailed user profiles
- Course management with status filtering, category CRUD, and enrollment-aware deletion
- Payment list with detail view and refund processing
- Payout management with approve/reject workflow and instructor balance tracking
- Platform settings for commission rate, currency, and per-country tax rates stored in DB

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Express.js, TypeScript, Zod validation |
| Database | PostgreSQL (Neon), Prisma ORM |
| Storage | RustFS (S3-compatible) with presigned URLs |
| Video Processing | FFmpeg, BullMQ job queues, Redis |
| Streaming | HLS.js with adaptive bitrate playback |
| Auth | JWT (httpOnly cookies), bcrypt |

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Next.js    │────▶│  Express API │────▶│  PostgreSQL   │
│  (port 3000)│     │  (port 5000) │     │  (Neon)       │
└─────────────┘     └──────┬───────┘     └──────────────┘
                           │
                    ┌──────┴───────┐
                    │              │
               ┌────▼────┐  ┌─────▼─────┐
               │ RustFS  │  │   Redis    │
               │ (S3)    │  │            │
               └─────────┘  └─────┬──────┘
                                  │
                           ┌──────▼──────┐
                           │  BullMQ     │
                           │  Worker     │
                           │  (FFmpeg)   │
                           └─────────────┘
```

## 🎬 Video Pipeline

The core differentiator of this project is the end-to-end video processing pipeline:

1. **Upload** — Instructor selects a video file. The backend generates presigned S3 URLs, the frontend uploads directly to RustFS via an XHR proxy (avoiding CORS issues) with progress tracking.

2. **Transcode** — On upload completion, a BullMQ job is enqueued. The worker downloads the raw file, runs FFmpeg to produce three HLS quality tiers (1080p, 720p, 480p) with 6-second segments, and generates a master playlist for adaptive bitrate switching.

3. **Stream** — The frontend player uses HLS.js to load the master playlist, automatically selecting the best quality based on network conditions. Supports manual quality override, playback speed (0.25x to 2x), picture-in-picture, fullscreen, and keyboard shortcuts.

4. **Status tracking** — The frontend polls processing status every 3 seconds, showing progress from uploading → processing → ready (or failed with retry).

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker (for RustFS and Redis)
- PostgreSQL database (Neon or local)

### Setup

```bash
# Clone
git clone <repo-url>
cd relay

# Start infrastructure
docker compose up -d

# Server
cd server
cp .env.example .env    # Configure DATABASE_URL, JWT_SECRET, etc.
npm install
npx prisma db push
npm run dev

# Client (new terminal)
cd client
npm install
npm run dev
```

The app runs at `http://localhost:3000` (frontend) and `http://localhost:5000` (API).

An admin account is auto-created on first boot: `admin@relay.com` / `admin123`.

## 📁 Project Structure

```
relay/
├── client/                     # Next.js frontend
│   ├── app/
│   │   ├── (auth)/             # Sign in, sign up
│   │   ├── (protected)/        # Learner: courses, checkout, account, studio
│   │   └── (admin)/            # Admin panel (separate layout)
│   ├── components/
│   │   ├── learner/            # Navbar, course cards, player, checkout
│   │   ├── studio/             # Instructor: overview, analytics, earnings
│   │   ├── admin/              # Admin: dashboard, user/course/payment tables
│   │   └── shared/             # Avatar upload, image crop, filters
│   ├── services/               # API client functions
│   ├── hooks/                  # Custom hooks (video player, auth)
│   └── types/                  # TypeScript type definitions
├── server/
│   └── src/
│       ├── modules/
│       │   ├── auth/           # Register, login, JWT, role checks
│       │   ├── courses/        # CRUD, publish workflow, slug routing
│       │   ├── chapters/       # Chapter ordering, CRUD
│       │   ├── lessons/        # Lesson CRUD, content types, quiz editor
│       │   ├── enrollments/    # Enrollment, progress, quiz attempts
│       │   ├── payments/       # Mock checkout, tax, coupons, receipts
│       │   ├── instructor/     # Stats, earnings, coupons, payouts
│       │   ├── uploads/        # Presigned URLs, video completion, transcode
│       │   └── admin/          # Dashboard, users, courses, settings, analytics
│       ├── middleware/         # Auth, authorization, rate limiting, error handling
│       └── lib/                # Prisma, Redis, S3 client
└── docker-compose.yml          # RustFS + Redis
```

## 🔮 Future Improvements

- **Real payment gateway**: Integrate Stripe or Razorpay for actual payment processing
- **Tests**: Add unit and integration tests for critical flows
- **Error boundaries**: React error boundaries for graceful failure recovery
- **Real-time updates**: WebSocket-based notifications and live analytics
- **Google OAuth**: Implement the full OAuth flow for social login
- **Video watch tracking**: Time-based progress with position resume
- **Course reviews and ratings**: Learner feedback system with aggregate ratings
