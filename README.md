# GreenSteps India - Carbon Footprint Tracker

GreenSteps India is a production-ready, full-stack web application built to help Indian citizens calculate, monitor, and reduce their carbon footprint. By leveraging localized emission factors (e.g. Indian electricity grid indices, transport averages, LPG canisters) and state-specific policy recommendations, the app provides a highly tailored gamified experience.

---

## 🛠️ Technology Stack

*   **Frontend**: React.js (Vite compiler) + Tailwind CSS (vanilla design system)
*   **Backend**: Node.js + Express.js API
*   **Database**: MongoDB Atlas (with localized in-memory database fallback)
*   **Authentication**: Firebase Authentication (Google OAuth + Password Email Login with simulated developer session fallback)
*   **Charts**: Recharts (dynamic carbon summaries and monthly trends)
*   **Maps**: Leaflet + OpenStreetMap (interactive regional participation indicators)
*   **Orchestration**: Docker & Docker Compose

---

## 🚀 Key Features

1.  **Dashboard**: Tracks annual carbon footprint estimates, rewards achievements, visualizes monthly reductions, and provides rotating daily eco-tips.
2.  **Carbon Footprint Calculator**: Multi-step slider wizard assessing transport mileage, power consumption, LPG cylinder usage, diet styles, shopping items, and waste sorting methods.
3.  **Gamification & Rewards**: plastic-free campaigns, no-car sundays, planting trees, points collection, and badge unlock cabinets.
4.  **Community Standings**: Leaderboard ranking citizens' points and comparative state-wide participation statistics.
5.  **Interactive India Map**: Plotting interactive circles scaling on local participation, cumulative state-wide savings, and custom state environmental campaigns.
6.  **Admin Control Panel**: Review citizen rosters, publish community challenges, analyze analytical breakdowns, and export reports to CSV.

---

## 📁 Project Structure

```
greensteps-india/
  ├── backend/
  │   ├── src/
  │   │   ├── config/db.js          # DB Connection & Mock Database Store
  │   │   ├── middleware/auth.js    # JWT & Mock Token Validation
  │   │   ├── models/               # Mongoose Schemas (User, Activity, Challenge)
  │   │   ├── routes/               # API Route Handlers
  │   │   └── index.js              # Express Entrypoint
  │   ├── Dockerfile
  │   └── package.json
  ├── frontend/
  │   ├── src/
  │   │   ├── components/           # UI Components (Dashboard, Calculator, Map, Admin)
  │   │   ├── context/AuthContext.jsx # Live/Mock Authentication Management
  │   │   ├── firebase/config.js    # Firebase Auth configuration
  │   │   ├── utils/                # India state data & carbon math utilities
  │   │   ├── App.jsx               # React Router Configuration
  │   │   └── main.jsx
  │   ├── Dockerfile
  │   └── package.json
  ├── docker-compose.yml            # Docker Container Orchestrator
  ├── deploy.sh                     # GCP manual deployment script
  ├── README.md
  └── API_DOCUMENTATION.md
```

---

## ⚙️ Setup & Local Running

The application is designed to be **instantly runnable out of the box**! If MongoDB or Firebase variables are left unconfigured in `.env`, the system automatically activates **Developer Mock Mode**. In this mode:
*   Authentication is bypassed (you can sign in with any email, or click quick buttons for Citizen/Admin accounts).
*   Data is saved in a server in-memory database and synchronized with the frontend client.
*   Leaderboards and Maps are pre-populated with realistic statistics from Indian states.

### Option A: Running Locally (Node.js)

#### 1. Setup Backend:
```bash
cd backend
cp .env.example .env
npm install
npm run dev
# Backend starts on http://localhost:5000
```

#### 2. Setup Frontend:
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
# Frontend starts on http://localhost:3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser to evaluate!

---

### Option B: Running with Docker Compose

To test the application containerized:
```bash
# In the root greensteps-india directory:
docker-compose up --build
```
This boots:
*   The Express backend on port `5000`.
*   The compiled React static Nginx server on port `3000`.

---

## ☁️ Deployment Ready for Google Cloud Platform

### Continuous Deployment via GitHub Actions
We have configured a CI/CD pipeline in `.github/workflows/deploy.yml` that triggers on pushes to the `main` branch. 
To configure this:
1.  Add your GCP Service Account Key (JSON) to your GitHub Repository Secrets as `GCP_SA_KEY`.
2.  Add secret values for `MONGO_URI`, `JWT_SECRET`, and Firebase keys.
3.  Deployments will build Docker images and release to **Google Cloud Run** services (`greensteps-api` and `greensteps-web`).

### Manual Google Cloud CLI Deployment
You can deploy directly from your local system using the provided script:
```bash
chmod +x deploy.sh
./deploy.sh <YOUR_GCP_PROJECT_ID>
```
The script will enable necessary GCP APIs, trigger a Cloud Build for the backend, deploy it, capture its live URL, and compile the frontend React app injecting the correct URL automatically.
