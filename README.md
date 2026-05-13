# Tutora

> A CRM-based SaaS platform empowering solo tutors and small coaching institutes to run their teaching business with professionalism — without the paperwork.

[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%20v5-339933?style=flat-square&logo=node.js)](https://expressjs.com)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![PWA](https://img.shields.io/badge/PWA-Offline%20%2B%20Background%20Sync-5A0FC8?style=flat-square&logo=googlechrome)](https://web.dev/progressive-web-apps)
[![Face Recognition](https://img.shields.io/badge/Face%20Recognition-face--api.js-FF6B6B?style=flat-square)](https://github.com/justadudewhohacks/face-api.js)
[![Frontend](https://img.shields.io/badge/Deployed-Vercel%20%2B%20Render-black?style=flat-square&logo=vercel)](https://vercel.com)

---

## The Problem

Solo educators juggle scattered tools — WhatsApp for communication, Google Sheets for attendance, mental notes for fees, and manual reminders for follow-ups. This fragmented workflow wastes hours every week and leaves critical student data siloed across apps.

## The Solution

Tutora brings everything into one dashboard: attendance with **face recognition**, a **parent-facing portal**, **offline PWA** support, student self-registration, batch management, and fee tracking — so tutors can focus on teaching, not paperwork.

---

## Flagship Features

### Face Recognition Attendance
> Mark attendance by recognising faces — no roll calls, no manual lookup.

Tutora runs a full face recognition pipeline entirely in the browser using [`face-api.js`](https://github.com/justadudewhohacks/face-api.js) — no images ever leave the device.

- **Face enrollment** — each student's face is captured once and encoded into a 128-dimensional descriptor vector, stored in MongoDB against their profile
- **Live detection** — SSD MobileNet detects faces in the webcam feed in real time
- **Matching** — FaceNet computes descriptor distance; a cosine threshold of `0.6` identifies the student with the closest match
- **Client-side only** — all model inference runs in the browser; model weights (~6 MB) are precached by the service worker so recognition works offline after first load
- **Fallback** — manual one-click marking still available alongside face recognition

---

### Parent Portal
> Parents stay informed without the tutor having to send a single WhatsApp message.

A completely separate, mobile-friendly portal for parents — distinct auth, distinct routes, distinct UI.

- **Separate login system** — parents authenticate via their own `parentToken` httpOnly cookie, completely isolated from the admin session
- **Attendance view** — parents see their child's attendance history with percentage, calculated correctly from the student's admission date
- **Fee transparency** — full payment history, current month's status, and overdue indicators visible to parents at any time
- **Schedule page** — responsive layout built for how each screen is used:
  - **Mobile**: horizontal day-pill picker (Mon–Sun) with dots on class days, today auto-selected; tapping a day shows the classes for that day below
  - **Desktop**: full grid table (subjects × days) with time chips in each cell, today's column highlighted
- **Smart error handling** — 401/403 responses redirect to parent login; network/server errors stay on the page so a flaky connection doesn't log parents out

---

### Progressive Web App (PWA)
> Installs like a native app. Works without internet. Syncs when you're back online.

Tutora is a fully offline-capable PWA powered by [Workbox](https://developer.chrome.com/docs/workbox), built with `vite-plugin-pwa`.

- **Installable** — tutors can install Tutora on their phone or desktop from the browser; it opens in its own window with no address bar
- **Offline reads** — all GET requests (students, attendance, fees, batches) use a **NetworkFirst** strategy with a 24-hour cache and 200-entry cap; stale data is shown instantly while a fresh fetch happens in the background
- **Background Sync** — attendance marks, fee updates, and any write operation made while offline are queued via the Background Sync API and automatically replayed when connectivity returns (24-hour retention window)
- **Precaching** — all JS/CSS/HTML bundles, images, fonts, and the full `face-api.js` model files (~6 MB) are precached at install time by Workbox, so the app loads at full speed even with no network
- **Stale-cache recovery** — after a new deployment, the old service worker may have cached outdated JS chunks. A `lazyWithReload` wrapper catches dynamic import failures and forces a full page reload, so users never see a blank screen after an update

---

## All Features

### Attendance
- One-click Present / Absent / Late marking per student per class
- **Auto-save with debounce** — changes sync 800ms after the last interaction; no save button, no data loss
- Calendar-based class log history with per-session attendance breakdown
- Attendance percentage calculated from the student's **admission date** (not the date they were added to the system)
- Smart constraints block marking future dates, wrong weekday for the batch, or classes before the batch start date

### Fee Management
- Monthly paid/unpaid tracking per student
- Full payment history log with dates
- Automatic overdue badges
- Per-student fee amount set at registration or manually

### Student Management
- Full profiles: name, grade, school, address, admission date, contact info (student + mom + dad email and phone)
- Add students manually or let them self-register via a shareable public link
- Edit any field inline from the student profile page

### Student Self-Registration
- Each institute gets a unique public onboarding link: `/register/:adminId`
- Students fill their own details (name, grade, school, contacts, fee amount, admission date) — no tutor involvement needed
- Submissions appear in the tutor's **Pending Approvals** queue with an animated collapsible panel and live count badge
- **Approve** individually (moves to student roster) or **Accept All** in one click
- Accept All uses `Promise.allSettled` — partial failures are reported without blocking successful approvals
- **Deny** opens a confirmation modal and permanently removes the submission

### Batch Management
- Create batches with name, subject, standard, scheduled weekdays, and time
- Assign students to one or more batches
- Batch schedule drives class log generation and the parent schedule page

### Dashboard
- Summary cards: total students, active batches, pending fees
- Quick navigation to attendance, fees, and student management

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 |
| Build tool | Vite |
| Styling | Tailwind CSS |
| UI components | shadcn/ui |
| Animation | Framer Motion |
| State management | Redux Toolkit (10 slices, write-through cache invalidation) |
| HTTP client | Axios with auth + error interceptors |
| Face recognition | face-api.js — SSD MobileNet detection + FaceNet 128-dim descriptors |
| PWA | Workbox via `vite-plugin-pwa` (NetworkFirst + BackgroundSync) |
| Backend runtime | Node.js |
| Backend framework | Express v5 |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Auth | JWT in httpOnly cookies — separate admin (`token`) and parent (`parentToken`) tokens |
| Password hashing | bcrypt |
| Rate limiting | express-rate-limit |
| Frontend hosting | Vercel (with API proxy rewrite) |
| Backend hosting | Render |

---

## Architecture Overview

```
Browser
  │
  ├─ /api/*  ──proxy──▶  Render (Express v5 backend)
  │              (vercel.json rewrites — same-origin, zero CORS config)
  │
  └─ /* ──────────────▶  Vite SPA (React 19)
                              │
                    ┌─────────┴──────────┐
                    │   Redux Store       │
                    │  (client cache)     │
                    └─────────┬──────────┘
                              │ Axios (axiosInstance)
                              ▼
                    Express v5  (Node.js)
                              │
                    ┌─────────┴──────────┐
                    │   Mongoose ODM      │
                    └─────────┬──────────┘
                              │
                         MongoDB Atlas
```

**Dual auth flow:**
- Admin: `POST /api/v1/admin/login` → `token` httpOnly cookie → `userAuth` middleware on all admin routes
- Parent: `POST /api/v1/parent/login` → `parentToken` httpOnly cookie → `parentAuth` middleware on all parent routes
- Two entirely separate auth contexts; cookies don't overlap

**Attendance auto-save pipeline:**
1. Tutor opens a class log → `useClassLog` fetches `/api/v1/classlog/:batchId/:date`
2. Tutor marks a student → Redux state updates immediately (optimistic UI)
3. 800ms debounce fires → `PATCH /api/v1/classlog/:id` sends only the changed student IDs
4. Backend updates the ClassLog document in-place; no full-document replacement

---

## Project Structure

```
tutora/
├── frontend/
│   ├── public/
│   │   └── models/              # face-api.js model weights (~6 MB, precached by SW)
│   ├── src/
│   │   ├── components/          # Shared UI (modals, cards, loaders, confirmation dialogs)
│   │   ├── hooks/               # Custom hooks (useFetchStudents, useClassLog, useAttendanceConstraints, …)
│   │   ├── pages/
│   │   │   ├── Student/         # Student management + PendingApprovals queue
│   │   │   ├── Attendance/      # Class log, calendar, face recognition
│   │   │   ├── Fee/             # Fee tracking pages
│   │   │   ├── Batch/           # Batch creation and management
│   │   │   ├── ParentPortal/    # Parent login, schedule, attendance, fees
│   │   │   └── StudentRegistration/ # Public onboarding form
│   │   ├── store/               # Redux slices
│   │   └── utilities/           # axiosInstance, API constants, helpers
│   ├── vite.config.js           # Vite + Workbox PWA configuration
│   └── vercel.json              # SPA fallback + /api/* proxy to Render
│
└── backend/
    ├── models/                  # Mongoose schemas (Admin, Student, Batch, ClassLog, PendingStudent, …)
    ├── routes/                  # Express routers (admin, student, batch, classlog, fee, registration, parent)
    ├── middleware/              # userAuth, parentAuth, rateLimiter
    └── index.js                 # App entry point
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/tutora
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=7d
PORT=8000
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
```

In production, Vercel's proxy rewrites `/api/*` to the Render backend — `VITE_API_URL` is left empty and all calls are same-origin automatically.

---

## Local Setup

**Prerequisites:** Node.js 18+, a MongoDB Atlas URI (or local MongoDB)

```bash
# 1. Clone
git clone https://github.com/suvrat007/tutora.git
cd tutora

# 2. Backend
cd backend
npm install
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm start                 # http://localhost:8000

# 3. Frontend (new terminal)
cd ../frontend
npm install --include=optional   # --include=optional required for face-api.js bindings
npm run dev               # http://localhost:5173
```

> The face recognition model weights are committed under `frontend/public/models/` and served statically — no separate download or CDN needed.

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/admin/signup` | — | Create admin account |
| POST | `/api/v1/admin/login` | — | Login, sets `token` cookie |
| GET | `/api/v1/admin/logout` | Admin | Clear auth cookie |
| GET | `/api/v1/student` | Admin | List all students |
| POST | `/api/v1/student` | Admin | Add student manually |
| PATCH | `/api/v1/student/:id` | Admin | Update student details |
| DELETE | `/api/v1/student/:id` | Admin | Remove student |
| GET | `/api/v1/batch` | Admin | List batches |
| POST | `/api/v1/batch` | Admin | Create batch |
| GET | `/api/v1/classlog/:batchId/:date` | Admin | Fetch or create class log |
| PATCH | `/api/v1/classlog/:id` | Admin | Update attendance records |
| GET | `/api/v1/fee` | Admin | Fee overview for all students |
| PATCH | `/api/v1/fee/:studentId/:month` | Admin | Mark fee paid/unpaid |
| GET | `/api/v1/register/pending` | Admin | List pending registrations |
| POST | `/api/v1/register/pending/:id/approve` | Admin | Approve a pending student |
| DELETE | `/api/v1/register/pending/:id` | Admin | Deny a pending registration |
| GET | `/api/v1/register/:adminId/info` | — | Public: fetch institute info |
| POST | `/api/v1/register/:adminId` | — | Public: submit student registration |
| POST | `/api/v1/parent/login` | — | Parent login, sets `parentToken` cookie |
| GET | `/api/v1/parent/me` | Parent | Authenticated parent + child data |
| GET | `/api/v1/parent/attendance` | Parent | Child's attendance history |
| GET | `/api/v1/parent/fee` | Parent | Child's fee history |
| GET | `/api/v1/parent/schedule` | Parent | Child's batch schedule |

---

## Roadmap

- [x] Attendance tracking with auto-save and debounce
- [x] Fee management and payment history
- [x] Batch scheduling
- [x] **Face recognition attendance** (client-side, offline-capable)
- [x] Student self-registration + pending approvals queue
- [x] **Parent portal** (attendance, fees, schedule — separate auth)
- [x] **PWA** — installable, offline reads, background sync for writes
- [ ] Content library (notes & video uploads)
- [ ] Automated announcements and homework reminders
- [ ] Test creation, grading, and performance analytics
- [ ] AI assistant for feedback, messages, and report generation

---

## Contributing

Issues, feature requests, and pull requests are welcome. Open an issue on GitHub to discuss what you'd like to change before sending a PR.

---

## License

MIT
