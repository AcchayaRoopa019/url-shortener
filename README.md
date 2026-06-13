# TrimURL - Full-Stack URL Shortener Application

GitHub Repository: [https://github.com/AcchayaRoopa019/url-shortener](https://github.com/AcchayaRoopa019/url-shortener)

TrimURL is a premium, high-performance, and visually stunning URL shortener built with React (Vite + Tailwind CSS), Node.js, Express, and MongoDB. It features real-time visual analytics (recharts), geolocation simulations, custom alias creation, link expiration, secure JWT-based user authentication, and interactive short URL redirect hyperlinks directly from the dashboard and analytics panels.

---

## 🏗️ Architecture & Request Flow

Below is the text-based architecture flowchart for the monorepo:

### 1. General API & Auth Flow
```text
┌─────────────────┐           ┌──────────────────┐           ┌─────────────────┐
│  React Client   │  Request  │  Express Server  │  Mongoose │  MongoDB Atlas  │
│  (Port 3000)    │──────────>│   (Port 5000)    │──────────>│  (Url Shortener)│
│                 │           │                  │           │                 │
│  • Auth Form    │  Bearer   │  • authMiddleware│   Query   │  • Users Col.   │
│  • Dashboard    │  Token    │  • Input Validate│           │  • Urls Col.    │
│  • Analytics    │           │  • route handlers│           │  • Analytics Col│
│                 │<──────────│                  │<──────────│                 │
│                 │  Response │                  │  Document │                 │
└─────────────────┘  (JSON)   └──────────────────┘           └─────────────────┘
```

### 2. Redirection & Analytics Collection Flow
```text
                         [ Visitor Clicks Short Link ]
                                       │
                                       ▼
                       GET /:shortCode (Port 5000)
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
          [ If Link Expired/Inactive ]             [ If Link Active ]
                    │                                     │
                    ▼                                     ▼
        Render 410/403/404 Page              1. Parse Browser/Device (UA)
                                             2. Resolve IP & Country (Mock)
                                             3. Save Analytics Document
                                             4. Increment totalClicks
                                             5. HTTP 302 Redirect to Long URL
                                                          │
                                                          ▼
                                              [ User lands on Target ]
```

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router DOM v6, Axios, Recharts, Lucide Icons, React Hot Toast, QRCode.react.
- **Backend**: Node.js, Express.js, Mongoose (MongoDB ODM), jsonwebtoken (JWT), bcryptjs, express-validator, ua-parser-js.
- **Database**: MongoDB.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally on `mongodb://localhost:27017` (or access to a MongoDB Atlas cluster URI)

### Setup Instructions

1. **Clone the project & Navigate to the root directory**:
   ```bash
   cd "company url"
   ```

2. **Setup the Backend**:
   - Go to the `server` directory:
     ```bash
     cd server
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create and configure environment variables in `.env` (you can copy `.env.example` as a starting point):
     ```env
     MONGO_URI=mongodb://localhost:27017/url-shortener
     JWT_SECRET=super_secret_jwt_key_here
     PORT=5000
     CLIENT_URL=http://localhost:3000
     BASE_URL=http://localhost:5000
     ```

3. **Setup the Frontend**:
   - Navigate to the `client` directory:
     ```bash
     cd ../client
     ```
   - Install dependencies:
     ```bash
     npm install --legacy-peer-deps
     ```
   - *Note: Vite dev server is preconfigured to run on Port 3000 to match the backend CORS options.*

---

## ⚡ Run Commands

### Development Mode (Simultaneous)
We recommend running both services concurrently. Open two terminal terminals:

**Terminal 1 (Backend Server)**:
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend Client)**:
```bash
cd client
npm run dev
```

---

## 💡 Assumptions Made
1. **Local Database Fallback**: A local MongoDB database (`mongodb://localhost:27017/url-shortener`) is assumed to be available. Users can override this by providing a `MONGO_URI` connection string in the `server/.env` file.
2. **Client Redirection**: For redirection of short codes, the backend handles the incoming redirect requests (`http://localhost:5000/:shortCode`) and logs the visitor analytics, then performs a standard 302 redirect. If a link has expired or is inactive, the backend directly serves a polished HTML error response (404/403/410) containing a link to go back to the dashboard.
3. **Analytics IP & Geolocation**: In local development environments, IP addresses resolve to loopbacks (`::1`, `127.0.0.1`). To showcase rich, beautiful charts and graphs for the hackathon showcase, the backend randomly simulates countries from a list (e.g., US, India, UK, Germany, Canada, Australia) for local requests if no standard geo-ip header is available.
4. **Vite Peer Deps**: We use `--legacy-peer-deps` for the frontend npm install to resolve library peer constraints with React 19.

---

## 📝 AI Planning Document Summary
The development of this monorepo URL shortener application was executed via a structured plan:
- **Phase 1: Database and Core Models Design**: Designed the User, URL, and Analytics schemas mapping constraints (unique codes, user ownership relations, and user-agent statistics fields).
- **Phase 2: Backend Routing & Auth Verification**: Implemented Express endpoints for registration, login, token generation, express-validator schema sanitation, and short-code route resolution.
- **Phase 3: Visual Client Layouts**: Built a glassmorphic dark theme interface using Tailwind, custom fonts, stat tracking components, responsive charts (Line, Pie, and Bar graphs), copy-to-clipboard widgets, and QR codes.
- **Phase 4: Verification & Redirection Testing**: Verified link redirection, expiration deactivations, and analytics logger increments.

---

## 🎥 Video Walkthrough
[Watch the Loom video demonstration](https://www.youtube.com/watch?v=dQw4w9WgXcQ) *(Placeholder Link)*

---

### Hackathon Credit
This project is a part of a hackathon run by https://katomaran.com.
