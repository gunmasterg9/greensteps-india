# GreenSteps India — Local Setup Guide

Get the project running on your machine in under 5 minutes.

---

## Option A — Quick Start (Mock Mode) ⚡

No database or Firebase setup needed. Works instantly.

### Step 1: Clone the repository

```bash
git clone https://github.com/gunmasterg9/greensteps-india.git
cd greensteps-india
```

### Step 2: Start the Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ GreenSteps India Backend running on port 5000
⚠️  Mock Authentication fallback active
⚠️  In-memory database mode active
```

### Step 3: Start the Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
VITE v5.x.x  ready in 1500ms
➜  Local: http://localhost:3000/
```

### Step 4: Open the App

Visit: **http://localhost:3000**

Use the **"Standard Citizen"** or **"App Admin"** quick-login buttons, or:

| Role | Email | Password |
|------|-------|----------|
| Standard User | `citizen@greensteps.in` | `password123` |
| Admin | `admin@greensteps.in` | `admin123` |

---

## Option B — Full Setup (Live MongoDB + Firebase) 🔥

### Step 1: Set up MongoDB Atlas

1. Sign up at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free **M0** cluster in **Mumbai (ap-south-1)**
3. Create a database user with read/write access
4. Allow all IPs (`0.0.0.0/0`) in Network Access
5. Copy the connection string

### Step 2: Set up Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (or link to existing GCP project)
3. Enable **Authentication** → **Email/Password** + **Google**
4. Get **Frontend config**: Project Settings → General → Your apps → Web
5. Get **Admin SDK**: Project Settings → Service Accounts → Generate key

### Step 3: Configure Environment Files

**Backend:**
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/greensteps
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
JWT_SECRET=your-random-secret
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
```
Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_MOCK_MODE=false
```

### Step 4: Start both servers

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

---

## Option C — Docker Compose (Both services together) 🐳

Requires Docker Desktop installed.

```bash
# In project root
docker-compose up --build
```

Services will start at:
- Frontend: http://localhost:3000
- Backend:  http://localhost:5000

---

## Common Issues & Fixes

### ❌ "Failed to fetch" on login
**Cause:** Frontend can't reach the backend.
**Fix:**
```bash
# Make sure backend is running
cd backend && npm run dev
# Verify frontend .env has correct URL
cat frontend/.env | grep VITE_API_URL
# Should show: VITE_API_URL=http://localhost:5000/api/v1
```

### ❌ "vite is not recognized"
**Cause:** node_modules not installed.
**Fix:**
```bash
cd frontend
npm install
npm run dev
```

### ❌ Port 5000 already in use
**Fix (Windows PowerShell):**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000
# Kill it (replace PID with the actual number)
taskkill /PID <PID> /F
```

### ❌ MongoDB connection failed
**Cause:** Wrong URI or network restrictions.
**Fix:** Check that your IP is whitelisted in MongoDB Atlas → Network Access.

---

## Development Scripts

| Command | Description |
|---------|-------------|
| `cd backend && npm run dev` | Start backend with hot-reload (nodemon) |
| `cd frontend && npm run dev` | Start frontend with HMR (Vite) |
| `cd frontend && npm run build` | Build production bundle |
| `docker-compose up` | Start both services via Docker |
| `git push origin main` | Trigger GitHub Actions CI/CD deploy |
