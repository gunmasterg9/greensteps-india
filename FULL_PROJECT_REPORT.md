# GreenSteps India — Full Project Report & Submission Document

**GreenSteps India** is a modern web platform designed to empower Indian citizens to calculate, track, and reduce their carbon footprint through gamification, local benchmark comparisons, and incentives.

---

## 1. Executive Summary
- **Aligned Problem Statement**: Combat climate change by democratizing carbon footprint awareness, education, and actionable sustainability tracking.
- **Key Solution**: An interactive dashboard, a multi-step carbon calculator using Indian emission factors, a rewards-based activity log, local state recommendations, and gamified challenges.
- **Ideal For**: Hackathons, ideathons, and municipal/state governance programs aiming to foster environmental responsibility.

---

## 2. Technical Stack & Architecture

```mermaid
graph TD
  User([Citizen Browser]) <-->|HTTPS| Web[Frontend: React/Vite/Tailwind]
  User <-->|REST API| API[Backend: Node.js/Express]
  API <-->|Mongoose| DB[(Database: MongoDB / Mock Store)]
  API <-->|Auth verify| Firebase[Firebase Auth SDK / Mock Token Handler]
```

- **Frontend**:
  - **Framework**: React 18 (Vite-powered SPA)
  - **Styling**: Tailwind CSS + Custom Brand Theme (Eco-Greens)
  - **Visualizations**: Recharts (Pie Chart and Area Charts)
  - **Mapping**: React Leaflet (OpenStreetMap integration for Indian State statistics)
- **Backend**:
  - **Runtime**: Node.js + Express API
  - **ORM**: Mongoose / MongoDB
  - **Authentication**: Firebase Admin SDK with a fully functioning fallback **offline mock mode** to run local development/testing without live Firebase/MongoDB.
- **Deployment**:
  - Multi-stage Dockerfiles + Nginx SPA routing.
  - Google Cloud Platform (GCP) Cloud Run services.

---

## 3. Mathematical Emission Models (Indian Benchmarks)

The application calculates emissions based on localized statistics from the **Central Electricity Authority (CEA)** and the **Ministry of New and Renewable Energy (MNRE)**:

| Category | Unit | Emission Factor (kg CO₂) | Details / Source |
| :--- | :--- | :--- | :--- |
| **Electricity** | per kWh | 0.82 | High emission factor due to coal-dominated grid |
| **LPG Cooking Gas** | per Cylinder | 42.3 | Standard 14.2 kg domestic LPG cylinder |
| **Petrol Car** | per km | 0.18 | Single-occupancy transit average |
| **Diesel Car** | per km | 0.14 | Direct combustion average |
| **Two-Wheeler** | per km | 0.06 | Motorbikes/scooters |
| **Electric Vehicle (EV)** | per km | 0.04 | Accounted for indirect grid charging |
| **Metro / Train** | per km | 0.015 | Mass electric transit efficiency |
| **High-Meat Diet** | per day | 2.5 | Heavy animal protein footprint |
| **Vegetarian Diet** | per day | 1.2 | Dairy, pulses, grains |
| **Vegan Diet** | per day | 0.7 | Fully plant-based footprint |
| **Shopping** | per item | 0.5 | Manufacturing & shipping general estimate |
| **Mixed Waste** | per kg | 0.6 | Landfill methane conversion |
| **Dry Recycling** | per kg | 0.1 | Sorting & processing footprint |

---

## 4. Platform Features
1. **Interactive Dashboard**: Real-time rotating eco tips, annual carbon counters, national benchmark checks (Indian average: 2,500 kg/year), and points ledger.
2. **Multi-Step Calculator**: Slides and fields to estimate monthly/annual footprints across transportation, power, diet, shopping, and waste.
3. **Log Tracker**: Daily check-in sheet to record eco-activities. Users earn Green Points (base 10 pts, with 25 pts bonuses for green transits, recycling, or vegan meals).
4. **Gamification & Badges**: Milestone badge unlock rules (e.g. *Eco Champ* badge unlocks when points exceed 200).
5. **Interactive Carbon Map**: An Leaflet map of India highlighting regional statistics and recommendations.

---

## 5. Recent Improvements & Polish

To elevate the submission quality and address hackathon requirements, the following updates were added:

### A. Testing Suite (30 Tests)
- **Backend Tests (Jest + Supertest)**: Added 11 API integration tests covering:
  - Carbon Calculation POST `/api/v1/carbon/calculate`
  - Activity Logging `/api/v1/activities` (scoring, validation, rewards points logic)
  - Auth Profile synchronization GET `/api/v1/auth/me`
  - Profile Update PUT `/api/v1/users/profile`
- **Frontend Tests (Vitest + React Testing Library + JSDOM)**: Added 19 unit & component tests covering:
  - `carbonCalculator.js` math models
  - Login/Register form rendering, input validation, and submission mocking
  - Multi-step CalculatorView wizard progress and validation

### B. Accessibility (WCAG 2.1 Compliance)
- Mapped all input and select controls to their labels using `htmlFor` and unique `id` properties.
- Added descriptive `aria-label` properties to icon-only buttons (mobile menu toggler, category selector pills, Google Sign-in button).
- Added `lang="en"` attribute to root HTML.

### C. Performance & Efficiency
- **React Lazy Loading**: Added `React.lazy` and `React.Suspense` for routers to split bundles and minimize initial loading assets.
- **Log Pagination**: Implemented backward-compatible paginated queries (`page` and `limit` parameters) in backend API routes and integrated Prev/Next buttons on the TrackerView table, optimizing response size for long-term usage.

### D. CI/CD Pipeline Integration
- Integrated automated tests run (`npm test` and `npm run test`) inside the GitHub Actions workflow (`deploy.yml`) before the container compilation and deployment steps.

---

## 6. Live Deployment Details (GCP Cloud Run)

Both services are live in the **asia-south1** region (Mumbai, India) for minimal latency:

- **Frontend Application URL**: [https://greensteps-web-736652973920.asia-south1.run.app](https://greensteps-web-736652973920.asia-south1.run.app)
- **Backend API Service URL**: [https://greensteps-api-736652973920.asia-south1.run.app](https://greensteps-api-736652973920.asia-south1.run.app)

---

## 7. Command Execution & Reference Manual

This section serves as a comprehensive reference for all commands and scripts required to build, test, lint, run, dockerize, and deploy the **GreenSteps India** platform.

> [!NOTE]
> All development scripts and configurations are defined in the project configuration files: [backend/package.json](file:///d:/Desktop/Challenge/greensteps-india/backend/package.json), [frontend/package.json](file:///d:/Desktop/Challenge/greensteps-india/frontend/package.json), [docker-compose.yml](file:///d:/Desktop/Challenge/greensteps-india/docker-compose.yml), [deploy.sh](file:///d:/Desktop/Challenge/greensteps-india/deploy.sh), and [.github/workflows/deploy.yml](file:///d:/Desktop/Challenge/greensteps-india/.github/workflows/deploy.yml).

### A. Local Installation & Development Commands

For a detailed step-by-step walkthrough, refer to [SETUP.md](file:///d:/Desktop/Challenge/greensteps-india/SETUP.md).

| Step | Command | Working Directory | Description | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **Clone Repo** | `git clone https://github.com/gunmasterg9/greensteps-india.git` | System Root | Clones the project repository locally. | ✅ Verified |
| **Backend Init** | `npm install` | `backend/` | Installs backend dependencies. | ✅ Verified |
| **Backend Run** | `npm run dev` | `backend/` | Starts backend using `nodemon` (watches files for automatic hot-reload) | ✅ Verified (Mock active) |
| **Frontend Init** | `npm install` | `frontend/` | Installs frontend dependencies. | ✅ Verified |
| **Frontend Run** | `npm run dev` | `frontend/` | Starts Vite development server at `http://localhost:3000` | ✅ Verified |
| **Frontend Preview** | `npm run preview` | `frontend/` | Locally previews the compiled production build | ✅ Verified |

---

### B. Testing, Quality Assurance & Linting Commands

Both services have automated test suites configured.

#### 1. Backend Verification (Jest + Supertest)
Run the following inside the `backend/` directory:
```bash
npm test
```
* **Description**: Runs 11 API integration tests covering routing, DB setup fallback, user profile updates, calculations, and active ledger logs.
* **Test Command Execution Result**:
  - **Suites**: 4 passed, 4 total
  - **Tests**: 11 passed, 11 total
  - **Mock Auth Fallback**: Active when Firebase credentials are absent.
  - **Mock Database Fallback**: Active when `MONGO_URI` is unconfigured.

#### 2. Frontend Verification (Vitest + React Testing Library)
Run the following inside the `frontend/` directory:
```bash
npm run test
```
* **Description**: Runs 19 unit and component test cases covering calculator math models, authentication UI, form fields, and wizards.
* **Test Command Execution Result**:
  - **Files**: 4 passed, 4 total
  - **Tests**: 19 passed, 19 total
  - **Duration**: ~19.66s

#### 3. Frontend Static Analysis (Linting)
Run the following inside the `frontend/` directory:
```bash
npm run lint
```
* **Description**: Runs `eslint` on all JS/JSX files using rules declared in [frontend/eslint.config.js](file:///d:/Desktop/Challenge/greensteps-india/frontend/eslint.config.js).
* **Pre-requisite Alert**:
  > [!WARNING]
  > Ensure that ESLint packages are installed. If missing from the workspace node modules, execute `npm install --save-dev eslint @eslint/js globals eslint-plugin-react-hooks eslint-plugin-react-refresh` first.

#### 4. Frontend Compilation (Production Build)
Run the following inside the `frontend/` directory:
```bash
npm run build
```
* **Description**: Packages the React SPA into static HTML, CSS, and JS chunks under the `dist/` directory using Vite.
* **Build Verification Output**:
  - **Result**: Successful compilation in 22.93s.
  - **Key Chunk Outputs**:
    - HTML: `dist/index.html` (1.25 kB)
    - CSS: `dist/assets/index-DH4llBtl.css` (32.94 kB)
    - Core bundle: `dist/assets/index-jrJlUOk9.js` (301.73 kB)
    - DashboardView bundle: `dist/assets/DashboardView-Bm3-B_IZ.js` (415.72 kB)

---

### C. Local Containerization & Orchestration

To run the full stack locally inside Docker containers, Docker Desktop must be running.

> [!TIP]
> This is the recommended option to verify production-like behaviors (like Nginx reverse proxying and route mapping) locally.

* **Start Services**:
  ```bash
  docker-compose up --build
  ```
  Starts backend at `http://localhost:5000` and frontend at `http://localhost:3000`.
* **Stop Services**:
  ```bash
  docker-compose down
  ```
  Shuts down containers and cleans up the bridge networks.

---

### D. Manual Cloud Deployment (Google Cloud Platform)

For detailed deployment scripts, see [deploy.sh](file:///d:/Desktop/Challenge/greensteps-india/deploy.sh) and [DEPLOYMENT_GUIDE.md](file:///d:/Desktop/Challenge/greensteps-india/DEPLOYMENT_GUIDE.md).

#### 1. Setup GCP SDK and Project
```bash
# Login to your account
gcloud auth login

# Create a project
gcloud projects create greensteps-india-prod --name="GreenSteps India"

# Set default project
gcloud config set project greensteps-india-prod
```

#### 2. Enable APIs & Create Artifact Registry
```bash
# Enable required Google APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

# Create container repository
gcloud artifacts repositories create greensteps \
  --repository-format=docker \
  --location=asia-south1 \
  --description="GreenSteps India Docker images"

# Authenticate local Docker daemon to Google Artifact Registry
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

#### 3. Setup GCP Secret Manager
To provision backend configuration values securely:
```bash
# Store MongoDB connection URI
echo -n "mongodb+srv://greensteps-admin:password@..." | gcloud secrets create MONGO_URI --data-file=-

# Generate and store JWT Secret key
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" | gcloud secrets create JWT_SECRET --data-file=-

# Store Firebase Admin Credentials
echo -n "project-id" | gcloud secrets create FIREBASE_PROJECT_ID --data-file=-
echo -n "client-email" | gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file=-
gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=- <<'EOF'
-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
EOF
```

#### 4. Build, Push & Deploy to Cloud Run
```bash
# Deploy Backend
docker build -t asia-south1-docker.pkg.dev/greensteps-india-prod/greensteps/greensteps-api:latest ./backend
docker push asia-south1-docker.pkg.dev/greensteps-india-prod/greensteps/greensteps-api:latest

gcloud run deploy greensteps-api \
  --image=asia-south1-docker.pkg.dev/greensteps-india-prod/greensteps/greensteps-api:latest \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=5000 \
  --memory=512Mi \
  --cpu=1 \
  --set-env-vars="NODE_ENV=production,PORT=5000" \
  --set-secrets="MONGO_URI=MONGO_URI:latest,JWT_SECRET=JWT_SECRET:latest,FIREBASE_PROJECT_ID=FIREBASE_PROJECT_ID:latest,FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest,FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest"

# Capture Backend URL
BACKEND_URL=$(gcloud run services describe greensteps-api --region=asia-south1 --format='value(status.url)')

# Deploy Frontend
docker build --build-arg VITE_API_URL=$BACKEND_URL/api/v1 -t asia-south1-docker.pkg.dev/greensteps-india-prod/greensteps/greensteps-web:latest ./frontend
docker push asia-south1-docker.pkg.dev/greensteps-india-prod/greensteps/greensteps-web:latest

gcloud run deploy greensteps-web \
  --image=asia-south1-docker.pkg.dev/greensteps-india-prod/greensteps/greensteps-web:latest \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=80 \
  --memory=256Mi \
  --cpu=1
```

---

### E. Automated GitHub Actions Deployments
A fully automated CI/CD pipeline is configured in [.github/workflows/deploy.yml](file:///d:/Desktop/Challenge/greensteps-india/.github/workflows/deploy.yml).

* **Trigger Command**:
  ```bash
  git add .
  git commit -m "feat: updates"
  git push origin main
  ```
* **Workflow Steps**:
  1. Runs backend test suites (`npm test`).
  2. Runs frontend test suites (`npm run test`).
  3. Builds frontend production asset package (`npm run build`).
  4. Tests backend server startup syntax configuration.
  5. Authenticates with GCP via Service Account secrets.
  6. Compiles production Docker containers using GCP Cloud Build.
  7. Pushes new images to Artifact Registry.
  8. Deploys updated images to Cloud Run services (zero downtime).

---

### F. Verification & Troubleshooting Commands

#### 1. Live Endpoint Verification
```bash
# Verify backend service is healthy
curl https://greensteps-api-736652973920.asia-south1.run.app/health

# Verify API responses (e.g. public leaderboard)
curl https://greensteps-api-736652973920.asia-south1.run.app/api/v1/leaderboard
```

#### 2. Local Port Conflicts (E.g. Port 5000 is occupied)
* **Windows (PowerShell)**:
  ```powershell
  # Find PID of the process occupying Port 5000
  netstat -ano | findstr :5000

  # Force terminate the process
  taskkill /PID <PID> /F
  ```
* **macOS / Linux**:
  ```bash
  # Find and kill the process using Port 5000
  lsof -i :5000 -t | xargs kill -9
  ```
