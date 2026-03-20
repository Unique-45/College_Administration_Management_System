# College Administration Management System - Frontend Development Plan

**Version:** 1.2  
**Created:** March 10, 2026  
**Last Updated:** March 20, 2026  
**Document Purpose:** Defines frontend work to be done with clear task assignments & progress tracking  
**Developers:** Karan Minj (Lead), Aryan Kumar  
**Project Duration:** 20 Days (Accelerated)  
**Target Launch:** March 30, 2026  
**Reference Document:** Software System Requirements Specification & Design (SRS)  
**Architecture:** Three-Tier MERN Stack (MongoDB, Express.js, React.js, Node.js)

---

## 📊 PROGRESS STATUS (As of March 20, 2026)

| Phase | Status | Completion | Lead | Notes |
|-------|--------|------------|------|-------|
| **Phase 1: Foundation & Setup** | ✅ **COMPLETED** | 100% | Karan Minj | All initialization, Redux, and config tasks done. Build & lint passing. |
| **Phase 2: Authentication & Layout** | 🔄 **IN PROGRESS** | 50% | Karan Minj | API services, interceptors, routes created. Auth pages skeleton done. |
| **Phase 3: Dashboard Implementation** | ⏳ **NOT STARTED** | 0% | Aryan Kumar | Pending Phase 2 completion |
| **Phase 4: Feature Implementation** | ⏳ **NOT STARTED** | 0% | Both | Attendance, Video, Payments, Notifications |
| **Phase 5: Analytics & Advanced** | ⏳ **NOT STARTED** | 0% | Both | Analytics dashboard & Events |
| **Phase 6: Testing & Deployment** | ⏳ **NOT STARTED** | 0% | Both | Final testing and production deployment |

### Phase 1 Completion Summary ✅
**Completed on:** March 20, 2026 (7 days after target, due to dependency issues)

**Tasks Completed:**
1. ✅ Project initialization with Vite & React 18.3.1
2. ✅ Absolute imports (@/ paths) - vite.config.js & jsconfig.json
3. ✅ All dependencies installed (443 packages, legacy-peer-deps)
4. ✅ Redux store configured with 4 slices:
   - authSlice.js - Login/logout/token management
   - userSlice.js - Profile & preferences
   - notificationSlice.js - Notifications & toasts
   - uiSlice.js - Sidebar, modals, theme
5. ✅ Configuration files:
   - eslint.config.js - React & hooks rules
   - .prettierrc - Code formatting
   - tailwind.config.js - Theme with custom colors
   - postcss.config.js - Tailwind & autoprefixer
   - .husky - Pre-commit & pre-push hooks
6. ✅ Environment configuration (src/config/environment.js)
7. ✅ Build verification - 143.57 kB bundle, 46.42 kB gzipped
8. ✅ Linting verification - 0 errors, 0 warnings
9. ✅ Fixed vite.config.js __dirname error
10. ✅ Fixed jsconfig.json TypeScript type definitions

**Build Status:**
- Build time: 741ms ✓
- Bundle size: 46.42 kB (gzipped) ✓
- ESLint: 0 errors, 0 warnings ✓
- All tests ready to run ✓

### Phase 2 Progress Summary (In Progress) 🔄
**Started:** March 20, 2026  
**Target Completion:** March 23, 2026  
**Karan Minj - Authentication Module (50% Complete)**

**Tasks Completed:**
1. ✅ Dashboard Redux Slice with async thunks (fetchStats, fetchUsers, fetchClasses, fetchReports, fetchNotifications)
2. ✅ API service layer (api.js, authService.js, dashboardService.js)
3. ✅ Auth interceptors & token management with JWT refresh logic
4. ✅ Form validation utilities (email, password strength, username, phone, date, age, etc.)
5. ✅ Authentication routes & page structure:
   - React Router setup with ProtectedRoute & RoleProtectedRoute
   - AuthLayout component
   - Login, Register, Forgot Password, Reset Password pages (skeleton)
   - Custom useRedux hooks
   - Redux Provider wrapped in main.jsx

**Build Status:**
- Build time: 696ms ✓
- Bundle size: 253.64 kB JS, 82.63 kB gzipped ✓
- ESLint: 0 errors, 9 warnings (expected - console statements) ✓
- 132 modules transformed ✓

**Remaining Phase 2 Tasks:**
6. ⏳ Implement Login component with form submission & API integration
7. ⏳ Implement Register component with validation
8. ⏳ Implement Forgot/Reset Password components
9. ⏳ Create Protected Routes middleware & Auth Guard
10. ⏳ Test all authentication flows end-to-end

---

## 📌 Task Assignment Summary

**Phase Assignments & Next Steps:**

| Phase | Lead Developer | Supporting Developer | Focus |
|-------|-----------------|---------------------|-------|
| Phase 1: Foundation & Setup | **Karan Minj** ✅ COMPLETE | Project setup, Redux setup (Karan) |
| Phase 2: Authentication & Layout | **Karan Minj** 🔄 IN PROGRESS (50%) | **Aryan Kumar** | Auth module (Karan), Layout (Aryan) |
| Phase 3: Dashboard Implementation | **Aryan Kumar** | **Karan Minj** | Admin & Teacher dashboards (Aryan), Student (Karan) |
| Phase 4: Feature Implementation | **Both (Parallel)** | - | Attendance/Payment (Karan), Video/Notifications (Aryan) |
| Phase 5: Analytics & Advanced Features | **Both (Parallel)** | - | Analytics (Karan), Events (Aryan) |
| Phase 6: Testing, Optimization & Deployment | **Both (Parallel)** | - | Unit & Integration (Both), E2E (Aryan), Performance (Karan) |

---

## 📑 Table of Contents
1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Development Phases](#development-phases)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Architecture & Design Patterns](#architecture--design-patterns)
7. [Component Breakdown](#component-breakdown)
8. [State Management Strategy](#state-management-strategy)
9. [API Integration Plan](#api-integration-plan)
10. [Styling & UI/UX](#styling--uiux)
11. [Testing Strategy](#testing-strategy)
12. [Performance Optimization](#performance-optimization)
13. [Security Implementation](#security-implementation)
14. [DevOps & Deployment](#devops--deployment)
15. [Risk Management](#risk-management)
16. [Success Metrics](#success-metrics)

---

## 1. Executive Summary

This frontend application is a **multi-role dashboard system** built with **React.js** for the College Administration Management System - a centralized digital platform that automates academic and administrative campus operations.

The system implements the **Presentation Layer** of a three-tier MERN stack, serving three distinct user roles (Admin, Teacher, Student) with customized dashboards, features, and workflows as defined in the SRS.

**Key Objectives (Aligned with SRS):**
- ✅ Implement JWT-based stateless authentication with RBAC
- ✅ Create role-specific dashboards (Admin, Teacher, Student)
- ✅ Build Teacher interface for attendance marking & video management
- ✅ Build Student interface for video streaming & fee payments
- ✅ Integrate Razorpay payment gateway with cryptographic validation
- ✅ Implement real-time notifications system
- ✅ Build analytics dashboards for reach and engagement metrics
- ✅ Ensure HTTPS, XSS, CSRF, and input validation protection
- ✅ Achieve accessibility and cross-browser compatibility

**Accelerated Timeline:** 20 Days  
**Team Size:** 2 Frontend Developers (Karan Minj - Lead, Aryan Kumar - Developer)  
**Success Criteria:** 
- ✅ All SRS functional requirements implemented (UC-01 through UC-05)
- ✅ Security requirements fully compliant (NFR-01, NFR-02)
- ✅ Lighthouse score > 85 (MVP target)
- ✅ Page load time < 2.5 seconds
- ✅ Zero critical security vulnerabilities
- ✅ Production deployment by March 30, 2026

---

## 2. Project Overview

### 2.1 System Architecture
According to SRS Section 7.1, the College Administration Management System utilizes a **three-tier client-server architecture** based on MERN stack:

```
┌─────────────────────────────────────────────────────┐
│    PRESENTATION LAYER (React.js) - This Project    │
│  (Web & Mobile Browsers - Interactive UI)          │
├──────────────┬──────────────┬──────────────────┤
│   Admin      │   Teacher    │   Student        │
│  Dashboard   │  Dashboard   │   Dashboard      │
│  (Role: Admin)│ (Role: Teacher) │ (Role: Student)│
└──────────────┴──────────────┴──────────────────┘
                      ↓ (REST API)
┌──────────────────────────────────────────────────────┐
│   BUSINESS LOGIC LAYER (Node.js/Express.js)        │
│   (Routing, Core Logic, Middleware, External APIs) │
├──────────────────────────────────────────────────────┤
│ - JWT Authentication & RBAC Middleware              │
│ - Attendance Tracking Logic                         │
│ - Event Scheduling                                  │
│ - Razorpay Payment Gateway Integration              │
└──────────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────┐
│     DATA LAYER (MongoDB NoSQL Database)             │
│  Collections: Users, Class, Attendance, Events,     │
│  Payments, Notifications, Videos                    │
└──────────────────────────────────────────────────────┘
```

### 2.2 SRS Functional Requirements Implementation & User Roles
Per SRS Section 2.3 & 4 (System Features), frontend implements three distinct user classes:

**Admin Role**
- System-wide privileges
- Manages user accounts
- Views platform analytics  
- Creates teacher accounts (enforced per business rule)
- Access: `/admin/*` routes

**Teacher Role**
- Manage assigned classes
- Mark attendance (Present, Absent, Late) - UC-02
- Upload/manage video content by subject - UC-4.2
- View attendance analytics - UC-04
- Access: `/teacher/*` routes

**Student Role**
- View assigned classes & schedule
- Access attendance records - UC-04
- Stream subject-wise videos - UC-4.3
- Pay fees through payment gateway - UC-03
- View notifications
- Access: `/student/*` routes

### 2.3 Functional Requirements Mapping

| SRS Requirement ID | Requirement Name | Frontend Module | Priority |
|-----------------|-----------------|-----------------|----------|
| UC-01 | User Authentication & RBAC | Authentication System | P0 |
| UC-02 | Mark Student Attendance | Attendance Management | P0 |
| UC-03 | Pay Campus Fees (Razorpay) | Payment Integration | P0 |
| UC-04 | View Attendance Records | Dashboard + Analytics | P0 |
| UC-05 | Manage Campus Events | Event Management | P1 |
| 4.2 | Video Content Management (Teacher) | Video Upload & Management | P0 |
| 4.3 | Subject-Wise Video Streaming | Video Streaming & Library | P0 |
| 4.4 | Reach Analytics | Analytics Dashboard | P1 |

### 2.4 Security Requirements (SRS Sections 5.3 & 7.4)
The frontend enforces all specified security protocols:

- ✅ **Transport Security** (NFR-01): HTTPS-only communication (enforced in API config)
- ✅ **JWT Authentication**: Tokens stored in httpOnly cookies (not localStorage), issued per SRS 4.1
- ✅ **Role-Based Access Control (RBAC)**: JWT payload checked for Admin/Teacher/Student roles
- ✅ **XSS Protection**: Input sanitization, CSP headers, no innerHTML usage
- ✅ **CSRF Protection**: CSRF tokens on all state-changing requests
- ✅ **Input Validation**: All user inputs validated & sanitized before API submission
- ✅ **Financial Transaction Security** (NFR-02): Payment verified via cryptographic signature on backend
- ✅ **Secure Dependencies**: Regular audits for vulnerabilities

### 2.5 MongoDB Collections Integration (SRS Section 7.3)
Frontend interacts with established MongoDB schemas:

| Collection | Purpose | Key Fields | Frontend Use |
|-----------|---------|-----------|--------------|
| **Users** | Authentication & Profiles | _id, username, email, role, profile_picture | Auth, Profile |
| **Class** | Class/Course Info | _id, teacher_id, subject, class_code | Dashboard, Video |
| **Attendance** | Attendance Records | _id, student_id, class_id, status (Present/Absent/Late), date | Marking, Analytics |
| **Events** | Campus Events | _id, event_name, date, created_by | Event Management |
| **Payments** | Fee Transactions | _id, student_id, amount, status, transaction_id, payment_captured | Payment Tracking |
| **Notifications** | System Alerts | _id, user_id, message, status (Read/Unread) | Notification Display |

### 2.6 Key Features to Implement
1. **Authentication & Authorization** (UC-01) - JWT stateless auth, RBAC middleware
2. **Role-Based Dashboards** - Admin, Teacher, Student customized views
3. **Attendance Management** (UC-02) - Teacher marking, student viewing, analytics
4. **Video Content Management** (4.2) - Teacher upload, categorization by subject & class
5. **Subject-Wise Video Streaming** (4.3) - Authenticated access, media player
6. **Fee Payment Processing** (UC-03) - Razorpay gateway, cryptographic webhook validation
7. **Reach Analytics** (4.4 & UC-04) - Video viewership, engagement metrics, attendance correlation
8. **Campus Notifications** - Real-time system alerts, notification center
9. **Event Management** (UC-05) - Create, view, RSVP functionality
10. **User Profile Management** - Edit profile, change password

---

## 3. Development Phases

### Phase 1: Foundation & Authentication Setup

**Duration:** 4 Days  
**Target Completion:** March 13, 2026  
**Lead Developer:** Karan Minj (Project Setup & Architecture)  

#### 3.1.1 Project Initialization (Assigned to: **Karan Minj**)

**Tasks:**
1. Initialize React app with Vite
2. Configure Git workflow and branching strategy
3. Set up development environment variables (.env.local)
4. Configure absolute imports (@/ paths)
5. Set up build and dev server configuration
6. Verify project runs without errors

**Deliverables:**
- Vite React project initialized and running
- Git workflow configured
- Development environment ready
- Absolute import paths working

#### 3.1.2 Project Structure Setup (Assigned to: **Karan Minj**)

**Directory Structure to Create:**
```
src/
├── components/
│   ├── Common/              # Shared components (Header, Footer, Sidebar)
│   ├── Auth/                # Authentication components
│   ├── Dashboard/           # Role-specific dashboards
│   ├── Attendance/          # Attendance components
│   ├── Video/               # Video management components
│   ├── Payment/             # Payment components
│   └── Notifications/       # Notification components
├── pages/                   # Page components (route-level)
├── services/                # API services (axios instances)
├── hooks/                   # Custom React hooks
├── store/                   # Redux state management
├── utils/                   # Helper functions, constants
├── styles/                  # Global styles, Tailwind config
├── layouts/                 # Layout components
├── middleware/              # Custom middleware (auth guards)
├── constants/               # App constants, API endpoints
└── config/                  # Configuration files
```

#### 3.1.3 Dependencies & Redux Setup (Assigned to: **Karan Minj**)

**Required Dependencies to Install:**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.5",
    "redux": "^4.2.1",
    "react-redux": "^8.1.3",
    "@reduxjs/toolkit": "^1.9.7",
    "tailwindcss": "^3.4.1",
    "headlessui": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^2.30.0",
    "react-player": "^2.14.2",
    "hls.js": "^1.4.14"
  },
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "vitest": "^1.0.4",
    "jsdom": "^23.0.1",
    "eslint": "^9.39.4",
    "prettier": "^3.1.1",
    "husky": "^8.0.3",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

#### 3.1.4 Configuration Files (Assigned to: **Karan Minj**)

**Configuration Files to Create:**
1. `.eslintrc.js` - ESLint configuration for code standards
2. `.prettierrc` - Prettier formatting configuration
3. `tailwind.config.js` - Tailwind CSS theme configuration
4. `.husky/pre-commit` - Git pre-commit hooks
5. `.husky/pre-push` - Git pre-push hooks
6. `postcss.config.js` - PostCSS configuration
7. `.env.local` - Local environment variables
8. `.env.example` - Environment template
9. `jsconfig.json` - Absolute imports configuration
10. `src/config/environment.js` - Environment utilities

**Redux State Slices to Create:**
1. `src/store/store.js` - Redux store configuration
2. `src/store/slices/authSlice.js` - Authentication state
3. `src/store/slices/userSlice.js` - User profile state
4. `src/store/slices/notificationSlice.js` - Notifications state
5. `src/store/slices/uiSlice.js` - UI state

**Global Styles:**
1. `src/styles/index.css` - Global CSS with Tailwind directives

**Acceptance Criteria:**
- Project runs without errors
- Code linting passes on all files
- Pre-commit hooks functional
- All dependencies can be installed and verified


### Phase 2: Dashboard Implementation

**Duration:** 4 Days  
**Target Completion:** March 17, 2026  
**Lead Developer:** Aryan Kumar  
**Supporting Developer:** Karan Minj  
**SRS Coverage:** UC-01, UC-04, Section 2.3

#### 3.2.1 Admin & Teacher Dashboards (Assigned to: **Aryan Kumar**)

**Components to Build:**
1. Overview/Statistics Cards (Total Users, Classes, Revenue, etc.)
2. Users Management Table
3. Classes Management Interface
4. Reports & Analytics View
5. System Health Monitor

**Acceptance Criteria:**
- Dashboard loads in < 2 seconds
- Charts/graphs render correctly
- Real-time data updates work (if applicable)
- Responsive design on all devices

#### 3.2.2 Teacher Dashboard (Assigned to: **Aryan Kumar**)

**Components to Build:**
1. Class Information Cards
2. Attendance Summary
3. Quick Actions (Mark Attendance, Upload Video)
4. Available Video Content Widget
5. Student List with Status

**Acceptance Criteria:**
- Teacher can view all assigned classes
- Quick attendance marking available
- Video upload links functional
- Real-time student count updates
5. Responsive navigation (mobile hamburger menu)
6. Active route highlighting

**Acceptance Criteria:**
- Layouts render correctly on all screen sizes
- Navigation items change based on user role
- User dropdown functional
- Mobile responsiveness working

#### 3.2.3 Student Dashboard (Assigned to: **Aryan Kumar**)

**Components to Build:**
1. Schedule/Timetable View
2. Fee Payment Status
3. Available Videos List
4. Attendance Record
5. Profile Information

**Acceptance Criteria:**
- Student can view personal schedule
- Payment status clearly shown
- Video access restricted to assigned content
- Attendance percentage calculated correctly
#### 3.2.4 Dashboard Redux Slices (Assigned to: **Karan Minj**)

**Slices to Create:**
- `dashboardSlice.js` - Dashboard data management
- `userSlice.js` - User profile and settings
- `notificationSlice.js` - System notifications

**Required Implementation:**
- Async thunks for API calls
- Loading states for all operations
- Error handling with user feedback
- Data caching for performance

**API Endpoints Required:**
```
GET /api/dashboard/stats
GET /api/dashboard/users
GET /api/dashboard/classes
GET /api/dashboard/reports
GET /api/notifications
POST /api/notifications/mark-read
```

**Acceptance Criteria:**
- All dashboard data loads on mount
- Real-time updates via polling or websockets
- Offline data persistence
- State management follows Redux best practices

---

#### 3.2.5 Authentication Module (Assigned to: **Karan Minj**)

**Components to Build:**
1. Login Page (`/login`)
2. Registration Page (`/register`)
3. Forgot Password Page (`/forgot-password`)
4. Reset Password Page (`/reset-password/:token`)
5. Email Verification Page
6. Auth Guard/Protected Routes

**Required Implementation:**
- JWT token stored in httpOnly cookies (for security)
- Token refresh logic on API interceptor
- Axios instance with auth interceptor
- Error handling for auth failures
- Loading states for async operations
- Form validation (email format, password strength)

**API Endpoints Required (from Backend):**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET /api/auth/verify
```

**Acceptance Criteria:**
- User can register with email validation
- User can login with correct credentials
- JWT token persists across page reloads
- Tokens refresh automatically
- Protected routes redirect to login
- All auth endpoints tested

---

### Phase 3: Core Features Implementation

**Duration:** 4 Days  
**Target Completion:** March 21, 2026  
**Lead Developer:** Karan Minj  
**Supporting Developer:** Aryan Kumar  
**SRS Coverage:** UC-02 (Attendance), UC-03 (Payments), 4.2 (Video Upload), 4.3 (Video Streaming)

#### 3.3.1 Attendance Management Module (Assigned to: **Karan Minj**)

**Teacher Interface Components:**
1. Attendance Marking Screen
   - Class selection dropdown
   - Student list with checkboxes
   - Mark as Present/Absent/Late
   - Bulk actions (Mark all present, etc.)
   - Submit with confirmation dialog
   - History of marked attendance

2. Attendance Records View (Student & Teacher Analytics)
   - Attendance records in table format
   - Filter by date range, subject, student
   - Attendance percentage by subject
   - Trends visualization (Chart)

3. Attendance Analytics (Admin/Teacher)
   - Attendance by student
   - Attendance by class
   - Comparative analysis
   - Export functionality (CSV/PDF)

**API Endpoints Required (from Backend):**
```
GET /api/attendance/class/:classId
POST /api/attendance/mark
GET /api/attendance/student/:studentId
GET /api/attendance/analytics
```

**Acceptance Criteria:**
- Teacher can mark attendance for all students in a class
- Attendance records persist and display correctly
- Students can view their attendance history
- Attendance percentage calculated accurately
- Charts display trends correctly

#### 3.3.2 Video Management Module (Assigned to: **Aryan Kumar**)

**Teacher Interface Components:**
1. Video Upload Screen
   - File selection (mp4, webm, mov)
   - Video metadata entry (title, description, subject, class)
   - Thumbnail upload/auto-generate
   - Category assignment
   - Upload progress bar
   - Draft/Publish status toggle

2. Video Library/Management
   - List of uploaded videos
   - Sort by date, subject, class
   - Search functionality
   - Edit metadata option
   - Delete video option
   - View statistics (views, watch time)

**Student Interface Components:**
1. Video Library/Browse
   - Filter by subject and class
   - Search videos
   - Recommended videos section

2. Video Player
   - HLS streaming with adaptive bitrate (quality auto-selection)
   - Manual quality selection (1080p, 720p, 480p, 360p)
   - Playback speed control (0.75x, 1x, 1.25x, 1.5x, 2x)
   - Subtitles support
   - Watch progress tracking

**API Endpoints Required (from Backend):**
```
POST /api/videos/upload
GET /api/videos
PUT /api/videos/:id
DELETE /api/videos/:id
GET /api/videos/stream/:id
POST /api/videos/progress
```

**Acceptance Criteria:**
- Video upload works for supported formats
- HLS streaming provides smooth playback
- Quality selection works correctly
- Progress tracking saves watch position
- Video access restricted by role/class

#### 3.3.3 Payment Integration Module (Assigned to: **Karan Minj**)

**Student Interface Components:**
1. Fee Payment Page
   - Display pending fees with amounts
   - Payment method selection (Razorpay/UPI)
   - Amount input with validation

**Acceptance Criteria:**
- Payment gateway integration works correctly
- Payment status updates in real-time
- Receipts generate and download properly
- Payment history displays all transactions
- Security measures prevent payment tampering

---

### Phase 4: Advanced Features & Refinement

**Duration:** 4 Days  
**Target Completion:** March 25, 2026  
**Lead Developer:** Aryan Kumar  
**Supporting Developer:** Karan Minj  
**SRS Coverage:** 4.4 (Reach Analytics), UC-04 (View Records), UC-05 (Events), Notifications

#### 3.4.1 Reach Analytics Module (Assigned to: **Karan Minj**)

**Teacher/Admin Interface Components:**
1. Video Analytics Dashboard
   - Total views per video
   - Watch time statistics
   - Student engagement metrics
   - Daily/Weekly/Monthly views chart

2. Student Engagement Analytics
   - Active students count
   - Most watched videos ranking
   - Student participation trends
   - Peak viewing time analysis

**Charts to Implement:**
- Line chart for view trends over time
- Bar chart for video comparison
- Pie chart for engagement distribution
- Heatmap for peak viewing times by day/hour

**Charts Library:** Recharts or Chart.js

**API Endpoints Required (from Backend):**
```
GET /api/analytics/videos
GET /api/analytics/videos/:id
GET /api/analytics/engagement
GET /api/analytics/viewership-trends
```

**Acceptance Criteria:**
- Charts render with correct data
- Performance: Analytics dashboard loads in < 3 seconds

#### 3.4.2 Event Management Module (Assigned to: **Aryan Kumar**)

**Admin/Teacher Interface:**
1. Event Creation Form
   - Event name and description
   - Date, time, and location fields
   - Image upload for event poster
   - Participant list management
   - Draft/Publish status toggle

2. Event Listing & Management (Admin/Teacher)
   - Upcoming events list
GET /api/attendance/class/:classId
POST /api/attendance/mark
GET /api/attendance/student/:studentId
GET /api/attendance/analytics
```

**Acceptance Criteria:**
- Teacher can mark attendance for all students in a class
- Attendance records persist and display correctly
- Students can view their attendance history
- Attendance percentage calculated accurately
- Charts display trends correctly

#### 3.4.2 Video Management Module (Assigned to: **Aryan Kumar**)

**Teacher Interface Components:**
1. Video Upload Screen
   - File selection (mp4, webm, mov)
   - Video metadata entry (title, description, subject, class)
   - Thumbnail upload/auto-generate
   - Category assignment
   - Upload progress bar
   - Draft/Publish status toggle

2. Video Library/Management
   - List of uploaded videos
   - Sort by date, subject, class
   - Search functionality
   - Edit metadata option
   - Delete video option
   - View statistics (views, watch time)

**Student Interface Components:**
1. Video Library/Browse
   - Filter by subject and class
   - Search videos
   - Recommended videos section

2. Video Player
   - HLS streaming with adaptive bitrate (quality auto-selection)
   - Manual quality selection (1080p, 720p, 480p, 360p)
   - Playback speed control (0.75x, 1x, 1.25x, 1.5x, 2x)
   - Subtitles support
   - Watch progress tracking
   - Remember last watched position

**API Endpoints Required (from Backend):**
```
POST /api/videos/upload
GET /api/videos
GET /api/videos/:id
DELETE /api/videos/:id
PUT /api/videos/:id
GET /api/videos/:id/stream
POST /api/videos/:id/watch-progress
```

**Performance Considerations:**
- Lazy load video thumbnails
- Implement video streaming (HLS for adaptive bitrate)
- Optimize video metadata fetching
- Cache frequently accessed videos

**Acceptance Criteria:**
- Videos upload successfully with progress indication
- Video streams without buffering issues
- Quality auto-adapts to internet speed
- Students can only access assigned videos
- Watch progress saved correctly

#### 3.4.3 Payment Integration Module (Assigned to: **Karan Minj**)

**Student Interface Components:**
1. Fee Payment Page
   - Display pending fees with amounts
   - Payment method selection (Razorpay/UPI)
   - Amount input with validation
   - Invoice/Receipt details

2. Payment Gateway Integration
   - Razorpay checkout modal integration
   - UPI payment option
   - Payment success/failure handling
   - Receipt generation and download

3. Payment History
   - List of all transactions with status
   - Filter by date range and payment status
   - Download receipts for each transaction
   - Refund status display

**Payment Flow Implementation:**
```
1. Student initiates payment
2. Show payment modal with amount and method options
3. User selects payment method (Razorpay/UPI)
4. Frontend sends order request to backend
5. Backend returns order ID
6. Frontend opens Razorpay/UPI checkout
7. User completes payment
8. Razorpay webhook verification happens on backend
9. Frontend polls or receives update on payment status
10. Show success/failure message & receipt
```

**API Endpoints Required (from Backend):**
```
POST /api/payments/initiate
POST /api/payments/verify
GET /api/payments/history
GET /api/payments/pending-fees
POST /api/payments/webhook (Backend only - for verification)
```

**Security Requirements (SRS Section 5.3 & 7.4):**
- Never expose Razorpay secret key to frontend
- Validate payment signature on backend before updating DB
- Verify webhook signature on backend with secret key
- Implement CSRF protection on all payment endpoints
- Log all payment attempts for audit trail
- Don't store sensitive payment data on frontend

**Acceptance Criteria:**
- Payment gateway modal opens correctly
- Successful payment updates database
- Failed payment shows appropriate error message
- Students can download receipts
- Fraud attempts are detected and prevented

#### 3.4.4 Notifications Module (Assigned to: **Aryan Kumar**)

**Components to Build:**
1. Notification Bell Icon with Badge
   - Show unread count badge
   - Click to open dropdown with recent notifications
   - List with timestamps and notification type

2. Notification Center Page
   - All notifications listed with pagination
   - Filter by type (Payment, Attendance, Event, System)
   - Mark as read / Mark all as read
   - Delete individual notifications
   - Real-time updates

3. Notification Toast System
   - Real-time toast notifications for immediate alerts
   - Different toast types (success, error, warning, info)
   - Auto-dismiss after configured duration

**Real-time Notification Implementation:**
- WebSocket integration for real-time notification delivery
- OR Polling every 10-15 seconds as fallback
- Toast notifications via react-hot-toast library

**API Endpoints Required (from Backend):**
```
GET /api/notifications
GET /api/notifications/unread
POST /api/notifications/:id/read
POST /api/notifications/read-all
DELETE /api/notifications/:id
WebSocket endpoint for real-time notifications
```

**Acceptance Criteria:**
- Notifications display in real-time
- Unread count updates correctly
- Users can mark notifications as read
- Users can delete old notifications
- Toast notifications appear for new events

---

### Phase 5: Testing, Optimization & Deployment

**Duration:** 6 Days  
**Target Completion:** March 30, 2026  
**Lead Developer:** Karan Minj & Aryan Kumar (Both)  
**SRS Coverage:** NFR-01 (Security), NFR-02 (Payments), 5.1 (Performance), 5.4 (Quality)

#### 3.5.1 Unit Testing (Assigned to: **Both**)

**Tests to Write:**
1. Utility function tests
2. Custom React hooks tests
3. Component rendering tests
4. Redux store and slices tests
5. API service tests

**Test Coverage Target:** > 80%
**Testing Framework:** Vitest + React Testing Library

#### 3.5.2 Integration Testing (Assigned to: **Both**)

**Integration Tests:**
1. Authentication flow (login, register, logout)
2. API integration with backend endpoints
3. Payment gateway integration
4. Video upload and streaming flow
5. Attendance marking and viewing flow

**Test Environment:** Staging backend

#### 3.5.3 End-to-End Testing (Assigned to: **Aryan Kumar**)

**E2E Test Scenarios:**

**Testing Tools:** Cypress or Playwright
**Browser Coverage:** Chrome, Firefox, Safari, Edge
**Test Coverage Target:** All critical user flows

#### 3.5.4 Performance Optimization (Assigned to: **Karan Minj**)

**Optimization Tasks:**
1. Code splitting for routes
2. Lazy loading of component routes
3. Image optimization and lazy loading
4. Bundle size analysis and reduction
5. Implement service workers for offline support
6. Cache optimization strategies
7. React DevTools profiling and optimization
8. Database query optimization coordination

**Performance Targets (from SRS Section 5.1):**
- Lighthouse Score > 85 (MVP target)
- Page load time < 2.5 seconds
- Bundle size < 500KB (gzipped)
- First Contentful Paint < 1.5 seconds

#### 3.5.5 Security Audit (Assigned to: **Aryan Kumar**)

**Security Checks (SRS Section 7.4):**
1. XSS protection verification
2. CSRF token validation
3. Input sanitization review
4. JWT token security (httpOnly cookies)
5. Sensitive data logging review
6. Dependencies vulnerability scan
1. Event Creation Form
   - Event name and description
   - Date, time, and location fields
   - Image upload for event poster
   - Participant list management
   - Draft/Publish status toggle

2. Event Listing & Management (Admin/Teacher)
   - Upcoming events list
   - Filter by date and event type
   - Edit event functionality
   - Delete event with confirmation
   - View RSVP status

**Student/User Interface:**
1. Event Listing (All Users)
   - Display upcoming events
   - Filter by date range and type
   - Event details view with map/location
   - RSVP button (Yes/No/Maybe)
   - Event calendar view

**API Endpoints Required (from Backend):**
```
POST /api/events
GET /api/events
GET /api/events/:id
PUT /api/events/:id
DELETE /api/events/:id
POST /api/events/:id/rsvp
GET /api/events/:id/attendees
```

**Acceptance Criteria:**
- Events created and displayed correctly
- RSVP functionality works for all users
- Only admins/teachers can create/edit events
- Calendar view displays events correctly
- Email notifications sent on RSVP

---

## 4. Technology Stack

#### 3.6.1 Unit Testing (Assigned to: **Both**)

**Tests to Write:**
1. Utility function tests
2. Custom React hooks tests
3. Component rendering tests
4. Redux store and slices tests
5. API service tests

**Test Coverage Target:** > 80%
**Testing Framework:** Vitest + React Testing Library

#### 3.6.2 Integration Testing (Assigned to: **Both**)

**Integration Tests:**
1. Authentication flow (login, register, logout)
2. API integration with backend endpoints
3. Payment gateway integration
4. Video upload and streaming flow
5. Attendance marking and viewing flow

**Test Environment:** Staging backend

#### 3.6.3 End-to-End Testing (Assigned to: **Aryan Kumar**)

**E2E Test Scenarios:**
1. Complete user registration and login flow
2. Dashboard navigation for all roles
3. Attendance marking workflow
4. Video upload and playback
5. Payment processing
6. Notification system
7. Event creation and RSVP
8. Role-based access controls

**Testing Tools:** Cypress or Playwright
**Browser Coverage:** Chrome, Firefox, Safari, Edge
**Test Coverage Target:** All critical user flows

#### 3.6.4 Performance Optimization (Assigned to: **Karan Minj**)

**Optimization Tasks:**
1. Code splitting for routes
2. Lazy loading of component routes
3. Image optimization and lazy loading
4. Bundle size analysis and reduction
5. Implement service workers for offline support
6. Cache optimization strategies
7. React DevTools profiling and optimization
8. Database query optimization coordination

**Performance Targets (from SRS Section 5.1):**
- Lighthouse Score > 85 (MVP target)
- Page load time < 2.5 seconds
- Bundle size < 500KB (gzipped)
- First Contentful Paint < 1.5 seconds

#### 3.6.5 Security Audit (Assigned to: **Aryan Kumar**)

**Security Checks (SRS Section 7.4):**
1. XSS protection verification
2. CSRF token validation
3. Input sanitization review
4. JWT token security (httpOnly cookies)
5. Sensitive data logging review
6. Dependencies vulnerability scan

**Security Compliance:**
- Zero localStorage usage for auth tokens
- All sensitive API calls over HTTPS
- CORS headers properly configured
- CSP headers implemented

#### 3.6.6 Cross-browser Testing (Assigned to: **Aryan Kumar**)

**Browser Coverage:**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile: iOS Safari, Chrome Mobile

**Responsive Testing:**
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667, 414x896)

**Acceptance Criteria:**
- Lighthouse Score ≥ 85
- Page load time ≤ 2.5 seconds
- Bundle size ≤ 500KB (gzipped)
- Test coverage ≥ 80%
- Works on all major browsers
- Zero critical security vulnerabilities

---

## 3.7 Phase Timeline

| Phase | Duration | Target End Date | Key Deliverables |
|-------|----------|-----------------|------------------|
| Phase 1: Foundation & Authentication Setup | 4 Days | March 13, 2026 | Vite Setup, Auth, RBAC, Redux |
| Phase 2: Dashboard Implementation | 4 Days | March 17, 2026 | Admin/Teacher/Student Dashboards |
| Phase 3: Core Features Implementation | 4 Days | March 21, 2026 | Attendance, Video, Payment, Notifications |
| Phase 4: Advanced Features & Refinement | 4 Days | March 25, 2026 | Analytics, Events, Integrations |
| Phase 5: Testing, Optimization & Deployment | 6 Days | March 30, 2026 | Tests, Security Audit, Deployment |

---

## 4. Technology Stack

### 4.1 Core Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| React | ^18.x | UI Framework |
| React Router DOM | ^6.x | Routing |
| Axios | ^1.x | HTTP Client |
| Redux Toolkit | ^1.x | State Management |
| React Redux | ^8.x | Redux bindings |
| Tailwind CSS | ^3.x | Styling |
| Headless UI | ^1.x | Unstyled components |

### 4.2 UI & Visualization
| Library | Purpose |
|---------|---------|
| Recharts or Chart.js | Data visualization |
| React Player | Video playback |
| HLS.js | Video streaming |
| React Hot Toast | Toast notifications |

### 4.3 Development Tools
| Tool | Purpose |
|------|---------|
| Vite or CRA | Project bundler |
| ESLint | Code linting |
| Prettier | Code formatting |
| Husky | Git hooks |
| Vitest | Unit testing |
| React Testing Library | Component testing |
| Cypress | E2E testing |

---

## 5. Project Structure

```
college-admin-frontend/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Common/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── PageLoader.jsx
│   │   ├── Auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   └── ForgotPasswordForm.jsx
│   │   ├── Dashboard/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   └── StudentDashboard.jsx
│   │   ├── Attendance/
│   │   │   ├── AttendanceMarking.jsx
│   │   │   ├── AttendanceView.jsx
│   │   │   └── AttendanceChart.jsx
│   │   ├── Video/
│   │   │   ├── VideoUpload.jsx
│   │   │   ├── VideoLibrary.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   └── VideoCard.jsx
│   │   ├── Payment/
│   │   │   ├── PaymentForm.jsx
│   │   │   ├── PaymentHistory.jsx
│   │   │   └── ReceiptModal.jsx
│   │   └── Notifications/
│   │       ├── NotificationBell.jsx
│   │       ├── NotificationCenter.jsx
│   │       └── NotificationCard.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── AttendancePage.jsx
│   │   ├── VideoPage.jsx
│   │   ├── PaymentPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── store/
│   │   ├── store.js
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── userSlice.js
│   │   │   ├── attendanceSlice.js
│   │   │   ├── videoSlice.js
│   │   │   ├── paymentSlice.js
│   │   │   └── notificationSlice.js
│   │   └── middleware/
│   │       └── authMiddleware.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── attendanceService.js
│   │   ├── videoService.js
│   │   ├── paymentService.js
│   │   └── notificationService.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   ├── useRoles.js
│   │   └── useLocalStorage.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── middleware/
│   │   ├── ProtectedRoute.jsx
│   │   ├── RoleBasedRoute.jsx
│   │   └── authGuard.js
│   ├── styles/
│   │   ├── globals.css
│   │   ├── tailwind.css
│   │   └── animations.css
│   ├── layouts/
│   │   ├── MainLayout.jsx
│   │   ├── AuthLayout.jsx
│   │   └── DashboardLayout.jsx
│   ├── App.jsx
│   ├── index.jsx
│   └── config/
│       ├── routes.js
│       └── apiConfig.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .eslintrc.js
├── .prettierrc
├── .env.example
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md
```

---

## 6. Architecture & Design Patterns

### 6.1 Component Architecture

#### Presentation Components (Dumb Components)
```javascript
// Example: VideoCard.jsx
const VideoCard = ({ video, onClickPlay, onClickDelete }) => {
  return (
    <div className="video-card">
      <img src={video.thumbnail} alt={video.title} />
      <h3>{video.title}</h3>
      <p>{video.description}</p>
      <button onClick={() => onClickPlay(video.id)}>Play</button>
      <button onClick={() => onClickDelete(video.id)}>Delete</button>
    </div>
  );
};
```

#### Container Components (Smart Components)
```javascript
// Example: VideoLibraryContainer.jsx
const VideoLibrary = () => {
  const videos = useSelector(state => state.videos.list);
  const dispatch = useDispatch();
  
  const handlePlayVideo = (videoId) => {
    // Logic to play video
  };
  
  return (
    <div>
      {videos.map(video => (
        <VideoCard 
          key={video.id} 
          video={video}
          onClickPlay={handlePlayVideo}
        />
      ))}
    </div>
  );
};
```

### 6.2 State Management Pattern

**Redux with Redux Toolkit approach:**
- Slice-based state management
- Immer for immutable updates
- Thunks for async operations
- Middleware for logging and monitoring

```javascript
// Example: videoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchVideos = createAsyncThunk(
  'videos/fetchVideos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/videos');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const videoSlice = createSlice({
  name: 'videos',
  initialState: {
    list: [],
    loading: false,
    error: null
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});
```

### 6.3 Custom Hooks Pattern

```javascript
// useAuth.js - Custom hook for authentication
export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  
  return {
    ...auth,
    login: (credentials) => dispatch(loginUser(credentials)),
    logout: () => dispatch(logoutUser()),
    register: (userData) => dispatch(registerUser(userData))
  };
};

// Usage in component
const MyComponent = () => {
  const { isAuthenticated, user, login } = useAuth();
  // ...
};
```

### 6.4 Error Handling Pattern

```javascript
// API error handler
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    store.dispatch(logoutUser());
  } else if (error.response?.status === 403) {
    // Forbidden - show permission error
  } else if (error.response?.status >= 500) {
    // Server error
  }
  return Promise.reject(error);
};

// Axios interceptor
api.interceptors.response.use(
  response => response,
  error => handleApiError(error)
);
```

---

## 7. Component Breakdown

### High-Level Component Hierarchy

```
App
├── AuthLayout
│   ├── LoginPage
│   │   └── LoginForm
│   │       ├── EmailInput
│   │       ├── PasswordInput
│   │       └── SubmitButton
│   ├── RegisterPage
│   │   └── RegisterForm
│   └── ResetPasswordPage
│       └── ResetPasswordForm
└── DashboardLayout
    ├── Header
    │   ├── Logo
    │   ├── SearchBar
    │   ├── NotificationBell
    │   │   └── NotificationDropdown
    │   └── UserMenu
    ├── Sidebar
    │   └── NavigationItems (role-based)
    ├── MainContent
    │   └── (Role-specific Dashboard/Page)
    │       ├── AdminDashboard
    │       ├── TeacherDashboard
    │       └── StudentDashboard
    └── Footer
```

### Component Composition Guidelines

1. **Atomic Design Approach:**
   - Atoms: Basic UI elements (Button, Input, Badge)
   - Molecules: Combinations of atoms (FormGroup, Card)
   - Organisms: Complex UI sections (Form, Table)
   - Pages: Full page views

2. **Prop Guidelines:**
   - Keep components focused with single responsibility
   - Pass minimal required props
   - Use composition over prop drilling
   - Document prop types clearly

---

## 8. State Management Strategy

### Global State Structure
```javascript
{
  auth: {
    isAuthenticated: boolean,
    user: User | null,
    token: string,
    loading: boolean,
    error: string | null
  },
  ui: {
    theme: 'light' | 'dark',
    sidebar: { isOpen: boolean },
    notifications: Toast[]
  },
  attendance: {
    records: AttendanceRecord[],
    loading: boolean,
    error: string | null
  },
  videos: {
    list: Video[],
    currentVideo: Video | null,
    uploadProgress: number,
    loading: boolean
  },
  payments: {
    pendingFees: Fee[],
    history: Payment[],
    processing: boolean
  },
  notifications: {
    list: Notification[],
    unreadCount: number
  }
}
```

### Best Practices
1. **Normalization:** Store data in normalized form to avoid duplication
2. **Selectors:** Use reselect for memoized selectors
3. **Middleware:** Use thunks for async operations
4. **Time-travel debugging:** Enable Redux DevTools in development

---

## 9. API Integration Plan

### 9.1 Axios Configuration
```javascript
// api.js
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      // If refresh fails, redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 9.2 Service Layer Pattern
```javascript
// attendanceService.js
export const attendanceService = {
  fetchAttendanceRecords: (params) => 
    api.get('/attendance', { params }),
  
  markAttendance: (data) => 
    api.post('/attendance/mark', data),
  
  getStudentAttendance: (studentId) => 
    api.get(`/attendance/student/${studentId}`),
  
  getAnalytics: (params) => 
    api.get('/attendance/analytics', { params })
};
```

### 9.3 API Response Handling
```javascript
// Consistent response format
{
  success: boolean,
  data: T | null,
  message: string,
  statusCode: number,
  timestamp: ISO8601String
}

// Error response format
{
  success: false,
  message: string,
  errors: {
    fieldName: [errorMessage]
  },
  statusCode: number
}
```

### 9.4 Retry Logic
```javascript
// Implement exponential backoff for failed requests
const axiosRetry = require('axios-retry');

axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay
});
```

---

## 10. Styling & UI/UX

### 10.1 Design System

**Color Palette:**
```javascript
// tailwind.config.js
colors: {
  primary: '#3B82F6',    // Blue
  secondary: '#8B5CF6',  // Purple
  success: '#10B981',    // Green
  error: '#EF4444',      // Red
  warning: '#F59E0B',    // Amber
  info: '#0EA5E9',       // Cyan
  neutral: '#6B7280'     // Gray
}
```

**Typography:**
- Headings: Inter Bold
- Body: Inter Regular
- Code: Fira Code

**Spacing System:** Tailwind default (4px base unit)

**Border Radius:** 
- Small: 4px
- Medium: 8px
- Large: 12px
- Full: 9999px

### 10.2 Responsive Design

**Breakpoints:**
- Mobile: 320px-480px
- Tablet: 481px-768px
- Desktop: 769px-1024px
- Large Desktop: 1025px+

**Mobile-First Approach:**
```css
/* Mobile styles */
.card { padding: 1rem; }

/* Tablet and up */
@media (min-width: 768px) {
  .card { padding: 1.5rem; }
}
```

### 10.3 Accessibility (WCAG 2.1 Level AA)

Requirements:
- [ ] Proper heading hierarchy (h1, h2, h3...)
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation support
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Touch targets ≥ 44x44px
- [ ] Alt text for images
- [ ] Form labels properly associated

```javascript
// Example: Accessible button
<button 
  aria-label="Close dialog"
  onClick={onClose}
  className="text-gray-600 hover:text-gray-900"
>
  <XIcon size={24} />
</button>
```

### 10.4 Dark Mode Support
```javascript
// Using Tailwind dark mode
<div className="bg-white dark:bg-slate-900">
  <p className="text-black dark:text-white">Content</p>
</div>
```

---

## 11. Testing Strategy

### 11.1 Testing Pyramid

```
        E2E Tests (5%)
       /            \
      /    Integration  \
     /       Tests (15%)  \
    /                      \
   /____ Unit Tests (80%)____\
```

### 11.2 Unit Testing
**Framework:** Vitest / Jest  
**Library:** React Testing Library

**Coverage Requirements:**
- Utility functions: 100%
- Hooks: >90%
- Components: >80%
- Reducers: 100%

**Example Test:**
```javascript
// button.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### 11.3 Integration Testing
**Focus Areas:**
- Redux store integration
- API service integration
- Multi-component workflows

```javascript
// attendanceMarking.integration.test.jsx
describe('Attendance Marking Flow', () => {
  it('should mark attendance and update store', async () => {
    // Setup
    const { store } = renderWithProviders(<AttendanceMarking />);
    
    // Simulate marking attendance
    // Assert store state updated
    // Assert API called
  });
});
```

### 11.4 E2E Testing
**Framework:** Cypress or Playwright

**Key Scenarios to Test:**
1. User login flow
2. Attendance marking
3. Video upload and viewing
4. Payment process
5. Notification reception

```javascript
// attendance.cy.js
describe('Attendance Management', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/teacher/attendance');
  });

  it('should mark attendance for all students', () => {
    cy.get('[data-testid="student-checkbox"]')
      .first()
      .click();
    cy.get('[data-testid="submit-btn"]').click();
    cy.get('[data-testid="success-toast"]')
      .should('be.visible');
  });
});
```

### 11.5 Performance Testing
- Lighthouse CI for CI/CD pipeline
- Bundle size analysis (Bundlesize)
- Load time testing
- Rendering performance profiling

---

## 12. Performance Optimization

### 12.1 Code Splitting
```javascript
// Route-based code splitting
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const TeacherDashboard = lazy(() => import('../pages/TeacherDashboard'));

function Routes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/teacher" component={TeacherDashboard} />
      </Switch>
    </Suspense>
  );
}
```

### 12.2 Image Optimization
- Use Next-Gen formats (WebP with fallback)
- Lazy load images below the fold
- Responsive images with srcset
- Image compression tools (TinyPNG, ImageOptim)

```jsx
<img 
  src="image.jpg"
  srcSet="image-mobile.jpg 480w, image-desktop.jpg 1024w"
  sizes="(max-width: 600px) 480px, 1024px"
  loading="lazy"
  alt="Description"
/>
```

### 12.3 Bundle Optimization
- Remove unused dependencies
- Tree shaking
- Minification
- Gzip compression on server

**Tools:**
- Webpack Bundle Analyzer
- Source Map Explorer

### 12.4 React Performance
- Memoization with React.memo
- useMemo and useCallback hooks
- Virtual scrolling for long lists
- Debouncing/throttling for expensive operations

```javascript
// Memoized component
const VideoCard = React.memo(({ video, onPlay }) => {
  return <div>{video.title}</div>;
}, (prevProps, nextProps) => {
  return prevProps.video.id === nextProps.video.id;
});

// useCallback for event handlers
const handleDelete = useCallback((id) => {
  deleteVideo(id);
}, []);
```

### 12.5 Caching Strategy
- HTTP caching headers
- Local storage for user preferences
- IndexedDB for offline data
- Service workers for offline support

---

## 13. Security Implementation (Per SRS Sections 5.3 & 7.4)

### 13.1 Authentication Security (SRS 4.1 & 7.4.1)
**JWT-based Stateless Authentication:**
- [ ] Implement JWT token issuance on successful login
- [ ] Store tokens in **httpOnly cookies** (not localStorage) - prevents XSS theft
- [ ] Implement automatic token refresh mechanism (before expiry)
- [ ] Validate JWT signature and expiry on every request
- [ ] Backend responsibility: Password hashing via bcrypt or argon2 per SRS 7.4.2
- [ ] Email verification for new accounts (backend-driven)
- [ ] Rate limiting on login/registration attempts

**RBAC Implementation (SRS 7.4.1):**
```javascript
// Frontend RBAC middleware checks JWT payload
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const user = req.user; // From JWT payload
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Only Admin can create teacher accounts (SRS Business Rule)
// Only Teacher can mark attendance (SRS Business Rule)
// Only Student can pay fees (SRS Business Rule)
```

### 13.2 XSS Prevention (SRS 5.3)
**Input Sanitization & Output Encoding:**
- [ ] Sanitize all user input before API submission
- [ ] Use Content Security Policy (CSP) headers on backend
- [ ] Avoid innerHTML - use textContent or sanitization libraries
- [ ] Sanitize HTML content when displaying user-generated content

```javascript
import DOMPurify from 'dompurify';

// Sanitize before API submission
const sanitizedInput = DOMPurify.sanitize(userInput);

// For displaying HTML safely
const sanitizedHTML = DOMPurify.sanitize(richTextContent, { 
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'] 
});
```

### 13.3 CSRF Protection (SRS 5.3)
**Cross-Site Request Forgery Prevention:**
- [ ] Implement CSRF tokens on state-changing requests (POST, PUT, DELETE)
- [ ] Validate SameSite cookie attribute (SameSite=Strict)
- [ ] Backend validates referer headers for sensitive operations

```javascript
// Add CSRF token to request headers
api.interceptors.request.use(config => {
  // Get CSRF token from meta tag or cookie
  const token = document.querySelector('meta[name="csrf-token"]')?.content 
    || getCookie('CSRF-Token');
  
  if (token && ['POST', 'PUT', 'DELETE'].includes(config.method.toUpperCase())) {
    config.headers['X-CSRF-Token'] = token;
  }
  return config;
});
```

### 13.4 Data Protection (SRS 5.3 & 7.4.2)
**Encryption & Secure Storage:**
- [ ] **Transport Security**: HTTPS/TLS 1.2+ for all API communication
- [ ] **At-Rest**: Never store sensitive data in localStorage (JWT in httpOnly cookies only)
- [ ] **PII Protection**: Don't log PII to console in production
- [ ] **CDN Usage**: Serve static assets through CDN with integrity headers
- [ ] **Sensitive Operations**: Implement re-authentication for password/payment changes

```javascript
// Secure storage - httpOnly cookies only
// NEVER store in localStorage:
// ❌ localStorage.setItem('token', jwt); // INSECURE
// ✅ Set via backend with httpOnly flag (SECURE)

// Never log sensitive data
console.log(userData); // ❌ If contains passwords/emails
console.log({ userId: userData.id }); // ✅ Log only non-sensitive fields
```

### 13.5 Payment Security (SRS 5.3 & UC-03)
**Razorpay Integration Security:**
- [ ] Use Razorpay test keys in development (from .env)
- [ ] **CRITICAL**: Never expose Razorpay secret key to frontend
- [ ] Never handle sensitive payment data on frontend
- [ ] Validate payment via backend webhook with cryptographic signature (x-razorpay-signature)
- [ ] Prevent duplicate webhook processing with idempotency keys
- [ ] Store only non-sensitive transaction data (transaction_id, status, amount)

```javascript
// Frontend: Initiate payment securely
const initiatePayment = async (amount) => {
  // Backend creates Razorpay order
  const response = await api.post('/payments/create-order', { amount });
  
  // Open Razorpay checkout (handles sensitive data securely)
  const options = {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Public key only
    amount: response.data.amount,
    currency: 'INR',
    order_id: response.data.orderId,
    handler: handlePaymentSuccess,
    prefill: { /* user non-sensitive data */ }
  };
  
  const rzp = new window.Razorpay(options);
  rzp.open();
};

// Backend ONLY: Verify webhook signature with secret
const verifyWebhook = (signature, body, secret) => {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return hash === signature; // Prevent spoofed payments (SRS 5.3)
};
```

### 13.6 Dependency Security
**Vulnerability Management:**
```bash
# Regular security audits
npm audit                    # Check for vulnerabilities
npm audit fix               # Fix automatically fixable issues
npm update                  # Keep dependencies current

# Use continuous monitoring:
# - Snyk: npm install -g snyk && snyk test
# - OWASP Dependency Check
```

**Secure Dependency Practices:**
- [ ] Pin exact versions for critical dependencies
- [ ] Review major version updates before upgrading
- [ ] Avoid deprecated or unmaintained packages
- [ ] Whitelist production dependencies in package.json

### 13.7 Environment Variables (SRS Section 2.7)
**Never commit sensitive keys - manage via .env files:**

```env
# .env.example (SHARE WITH TEAM - NO SECRETS)
REACT_APP_API_URL=https://api.example.com
REACT_APP_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX

# .env.local (NEVER COMMIT - LOCAL DEVELOPMENT)
# Create this locally with actual values

# Production .env (STORED SECURELY IN DEPLOYMENT PLATFORM)
REACT_APP_API_URL=https://api.production.com
REACT_APP_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
```

### 13.8 API Security (SRS 3.4)
**Communication Interface Protection:**
- [ ] Input validation on both frontend and backend (Defense in Depth)
- [ ] Rate limiting implemented server-side (frontend can display cooldown)
- [ ] API versioning (v1, v2) for backward compatibility
- [ ] Enforce HTTPS/TLS 1.2+ on all endpoints
- [ ] CORS properly configured (whitelist specific origins)
- [ ] Token expiry & refresh rotation

```javascript
// Frontend: Add Authorization header with JWT
api.interceptors.request.use(config => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Handle token expiry (401 response)
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expired - attempt refresh or redirect to login
      // Backend will validate refresh token
    }
    return Promise.reject(error);
  }
);
```

### 13.9 Security Checklist (Per SRS Compliance)
- [ ] **NFR-01 (Secure Access & Authorization)**
  - ✅ JWT token validation on all protected routes
  - ✅ RBAC enforced per user role (Admin/Teacher/Student)
  - ✅ Role-specific dashboards prevent unauthorized access
  
- [ ] **NFR-02 (Protect Financial Transactions)**
  - ✅ Payment data never stored in frontend
  - ✅ Backend validates Razorpay webhook signatures (x-razorpay-signature)
  - ✅ Transaction IDs and receipts tracked securely
  - ✅ Soft deletion (is_deleted flag) for failed transactions

- [ ] **Data Safety**
  - ✅ No sensitive data logged to console (production)
  - ✅ HTTPS enforced on all API calls
  - ✅ XSS/CSRF/Injection protections active
  - ✅ Dependencies regularly audited

---

## 14. DevOps & Deployment

### 14.1 Development Environment
**Setup Steps:**
```bash
git clone <repo>
cd college-admin-frontend
nvm use 18  # Use Node 18
npm install
cp .env.example .env.local
npm run dev
```

### 14.2 Build Process
```bash
# Production build
npm run build      # Creates optimized build in dist/
npm run preview    # Preview production build locally

# Expected output:
# - Minified JS/CSS
# - Optimized images
# - Source maps for debugging
# - Bundle size < 500KB
```

### 14.3 Deployment Targets
**Options:**
1. **Vercel** (Recommended for React)
   - Automatic deployments on push
   - Built-in optimization
   - Easy environment management

2. **Netlify**
   - Similar to Vercel
   - Good CI/CD integration

3. **AWS S3 + CloudFront**
   - More control
   - Cost-effective at scale

4. **Self-hosted (VPS)**
   - Full control
   - Requires more maintenance

### 14.4 CI/CD Pipeline
**GitHub Actions workflow example:**
```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Build
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
      
      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### 14.5 Monitoring & Logging
**Tools:**
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for user analytics

```javascript
// Sentry integration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 14.6 Database Monitoring
- Monitor MongoDB performance
- Set up alerts for slow queries
- Regular backups

---

## 15. Risk Management

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| API delays | High | Medium | Implement loading states, skeleton screens, timeouts |
| Payment gateway issues | Medium | High | Thorough testing, fallback payment methods |
| Video streaming lag | Medium | High | Use CDN, implement adaptive bitrate |
| Security vulnerabilities | Medium | Critical | Regular audits, security training, dependency updates |
| Team member absence | Low | High | Code documentation, knowledge sharing sessions |
| Browser compatibility | Low | Medium | Cross-browser testing, progressive enhancement |
| Database performance | Low | High | Proper indexing, caching, database optimization |
| Scope creep | High | Medium | Clear requirements, change management process |

---

## 16. Success Metrics

### 16.1 Performance Metrics
- [ ] Page load time < 2 seconds
- [ ] Bundle size < 500KB
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Largest Contentful Paint (LCP) < 2.5s

### 16.2 Quality Metrics
- [ ] Test coverage > 80%
- [ ] Zero high-severity security vulnerabilities
- [ ] < 5 bugs in production per sprint
- [ ] 99.5% uptime

### 16.3 User Experience Metrics
- [ ] Page bounce rate < 30%
- [ ] Average session duration > 5 minutes
- [ ] User satisfaction score > 4/5
- [ ] Zero critical user-reported issues

### 16.4 Development Metrics
- [ ] Sprint velocity consistency
- [ ] Code review turnaround < 24 hours
- [ ] Deployment frequency > 2x per week
- [ ] Mean time to recovery < 1 hour

---

## Appendix: Quick Reference

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests
npm run analyze      # Analyze bundle size
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: Add new feature"

# Push and create PR
git push origin feature/feature-name

# After approval, merge to develop
# Then merge develop to main for release
```

### Commit Message Convention
```
feat: Add new attendance marking feature
feat(video): Add video streaming support
fix: Resolve token refresh issue
docs: Update API documentation
style: Fix code formatting
refactor: Reorganize component structure
test: Add unit tests for auth service
chore: Update dependencies
```

### File Naming Conventions
- Components: PascalCase (VideoPlayer.jsx)
- Utilities: camelCase (formatDate.js)
- Styles: kebab-case (video-player.module.css)
- Tests: Same as source file with .test.js suffix

---

## Conclusion

This comprehensive plan provides a solid foundation for building a production-grade React frontend for the College Administration Management System. Regular progress reviews and adjustments based on team feedback are essential for success.

---

**Last Updated:** March 10, 2026
