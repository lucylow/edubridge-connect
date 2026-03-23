
# EduBridge – Democratizing Education, One Connection at a Time

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

EduBridge is a **full‑stack, open‑source platform** that connects student tutors with K‑12 learners in underserved communities. It provides a secure, community‑driven ecosystem with smart matching, integrated scheduling, real‑time communication, and AI‑powered tools – all completely free.

This repository contains the complete source code for the EduBridge project, built as part of **ImpactHacks 2026**.

---

## Table of Contents

- [📖 Overview](#-overview)
- [✨ Features](#-features)
- [🏗 Architecture](#-architecture)
- [🚀 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [⚙️ Installation](#️-installation)
- [🔧 Environment Variables](#-environment-variables)
- [🎭 Mock API (Demo Mode)](#-mock-api-demo-mode)
- [📡 API Endpoints](#-api-endpoints)
- [📊 Database Schema](#-database-schema)
- [🧠 AI Features](#-ai-features)
- [👥 User Roles](#-user-roles)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 📖 Overview

EduBridge aims to close the educational gap by leveraging the untapped potential of student volunteers. The platform enables:

- **Learners** (K‑12 students) to find free, personalized tutoring in subjects like Math, Science, English, and Programming.
- **Tutors** (college & high school students) to give back, gain teaching experience, and earn reputation.
- **Community Managers** (teachers, librarians, non‑profit coordinators) to oversee local instances and ensure safety.

---

## ✨ Features

### 🧑‍🏫 User & Role Management
- Separate sign‑up flows for **Tutors**, **Learners**, and **Community Managers**
- Email verification, password reset, and JWT‑based authentication
- Parent/guardian oversight for learners

### 🔍 Smart Matching Algorithm
- Subject‑based matching with scoring (relevance, availability, reputation, success rate)
- Cached results for performance
- Learners can send match requests; tutors accept/decline

### 📅 Integrated Scheduling Engine
- Tutors set availability in 30‑minute slots
- Real‑time calendar (react‑big‑calendar) with drag‑and‑drop
- Redis‑based locking prevents double‑booking
- Google Calendar sync (optional)

### 💬 In‑App Communication Hub
- Real‑time text chat (Socket.io) per session
- File uploads (PDFs, images, worksheets)
- Secure video calls via Daily.co (Jitsi alternative)
- Typing indicators and message history

### 🤖 AI‑Powered Tools (OpenAI)
- **Lesson Plan Generator**: Creates custom micro‑lesson plans
- **Session Summaries**: Transcribes and summarizes tutoring sessions (Whisper + GPT)
- **Smart Scheduling**: Suggests optimal meeting times based on availability

### ⭐ Feedback & Reputation System
- Post‑session ratings (1–5) with optional comments
- Reputation score with recency bias
- Flagging for moderation
- Admin dashboard with analytics

---

## 🏗 Architecture

EduBridge follows a modern, scalable architecture:

```mermaid
graph TB
    subgraph Client
        A[React SPA]
    end
    subgraph Server
        B[Node.js + Express]
        C[Socket.io]
        D[Prisma ORM]
    end
    subgraph Data
        E[(PostgreSQL)]
        F[(Redis)]
    end
    subgraph External
        G[OpenAI API]
        H[Daily.co API]
        I[Google Calendar API]
    end

    A -->|REST / WebSocket| B
    A -->|WebSocket| C
    B --> D
    D --> E
    B --> F
    B --> G
    B --> H
    B --> I
    C --> F
```

**Key components:**

- **Frontend**: React with Tailwind CSS, React Router, Framer Motion, Socket.io‑client.
- **Backend**: Node.js + Express, Prisma (database ORM), Socket.io, JWT auth.
- **Database**: PostgreSQL with Prisma migrations.
- **Caching**: Redis for matching results, availability slots, and distributed locks.
- **AI**: OpenAI API (GPT‑4, Whisper).
- **Video**: Daily.co REST API.
- **Real‑time**: Socket.io for chat and live updates.

---

## 🚀 Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Frontend     | React 18, Tailwind CSS, Framer Motion, Socket.io‑client, react‑big‑calendar, react‑hook‑form, zod |
| Backend      | Node.js, Express, Prisma, Socket.io, JWT, bcrypt, multer |
| Database     | PostgreSQL                                      |
| Cache        | Redis                                           |
| AI           | OpenAI (GPT‑4, Whisper)                         |
| Video        | Daily.co                                        |
| Deployment   | Vercel (frontend), Railway / Heroku (backend)   |

---

## 📁 Project Structure

```
edubridge/
├── backend/
│   ├── prisma/               # Database schema & migrations
│   ├── src/
│   │   ├── controllers/      # API logic
│   │   ├── middleware/       # Auth, error handling
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic (matching, AI, scheduling)
│   │   ├── utils/            # Helpers, JWT
│   │   ├── app.js            # Express app
│   │   └── server.js         # Entry point
│   ├── .env                  # Environment variables
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth, theme contexts
│   │   ├── pages/            # All pages (landing, dashboard, etc.)
│   │   ├── services/         # API calls
│   │   ├── mock/             # Mock data & handlers (fallback)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.development
│   └── package.json
└── README.md
```

---

## ⚙️ Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- Redis (v7+)

### 1. Clone the repository
```bash
git clone https://github.com/your-org/edubridge.git
cd edubridge
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env.development   # set VITE_API_URL to your backend URL
npm run dev
```

Now open `http://localhost:5173` to see the app.

---

## 🔧 Environment Variables

### Backend (`.env`)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/edubridge"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="sk-..."
DAILY_API_KEY="your-daily-key"
REDIS_URL="redis://localhost:6379"
PORT=5000
```

### Frontend (`.env.development`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK_API=false   # set to true to use mock data
```

---

## 🎭 Mock API (Demo Mode)

If you want to run the frontend without a real backend, set `VITE_USE_MOCK_API=true` in your frontend `.env`. The mock system (located in `frontend/src/mock/`) will simulate all API responses using an in‑memory database. This is perfect for:

- Hackathon demos
- Testing UI before backend is ready
- Offline development

**Mock credentials:**
- Tutor: `tutor@example.com` / `password`
- Learner: `learner@example.com` / `password`
- Admin: `admin@example.com` / `password`

---

## 📡 API Endpoints

| Method | Endpoint                       | Description                        | Auth |
|--------|--------------------------------|------------------------------------|------|
| POST   | `/api/auth/register`           | Register new user                  | No   |
| POST   | `/api/auth/login`              | Login                              | No   |
| GET    | `/api/auth/me`                 | Get current user                   | Yes  |
| PUT    | `/api/auth/me`                 | Update profile                     | Yes  |
| GET    | `/api/availability/tutor/:id`  | Get tutor’s available slots        | Yes  |
| POST   | `/api/availability`            | Create availability slots (tutor)  | Yes  |
| GET    | `/api/matching?subject=...`    | Get top tutors for a subject       | Yes  |
| POST   | `/api/sessions/request`        | Request a session (learner)        | Yes  |
| GET    | `/api/sessions/upcoming`       | Get upcoming sessions              | Yes  |
| POST   | `/api/feedback/reviews`        | Submit a review                    | Yes  |
| POST   | `/api/video/session/:id/room`  | Create video room                  | Yes  |
| POST   | `/api/ai/lesson-plan`          | Generate AI lesson plan            | Yes  |

A full Postman collection is available in `/docs`.

---

## 📊 Database Schema

```mermaid
erDiagram
    User ||--o{ UserSubject : has
    User ||--o{ AvailabilitySlot : defines
    User ||--o{ Session : tutor
    User ||--o{ Session : learner
    User ||--o{ Review : reviewer
    User ||--o{ Review : reviewee
    User ||--o{ Report : reporter
    User ||--o{ Report : reported
    Subject ||--o{ UserSubject : appears_in
    Session ||--o{ Review : receives
    Session ||--o| ChatMessage : contains
    AvailabilitySlot ||--o| Session : may_book
```

Key tables:
- `User` – stores all user data (role, profile, verification)
- `Subject` – list of available subjects
- `AvailabilitySlot` – tutor’s open slots
- `Session` – scheduled tutoring sessions
- `Review` – ratings and comments
- `ChatMessage` – real‑time messages per session
- `Report` – user‑reported issues

---

## 🧠 AI Features

### 1. Lesson Plan Generator
Uses OpenAI GPT‑4 to create a tailored 15‑minute lesson plan based on subject, grade level, and topic. Tutors can trigger it during a session.

### 2. Automated Session Summaries
Records the session audio (with consent), transcribes it via Whisper, and generates a summary + study guide with GPT‑4.

### 3. Smart Scheduling Assistant
Analyzes tutor and learner availability to suggest optimal meeting times, considering historical patterns and preferences.

All AI calls are made asynchronously and cached to minimize latency.

---

## 👥 User Roles

| Role               | Permissions                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **Learner**        | Browse tutors, send match requests, schedule sessions, leave reviews        |
| **Tutor**          | Set availability, accept/reject requests, host sessions, earn reputation    |
| **Community Manager** | Monitor flagged reviews, manage user reports, view platform analytics     |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Please ensure your code passes existing tests and follows the project’s coding style (Prettier, ESLint).

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with ❤️ for ImpactHacks 2026**

