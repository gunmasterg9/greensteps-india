# GreenSteps India — Deployment Guide

Complete step-by-step guide for deploying GreenSteps India to **Google Cloud Platform (GCP)** using **Cloud Run**, **Artifact Registry**, and **Secret Manager**.

---

## Prerequisites

Before starting, ensure you have:

| Tool | Version | Install |
|------|---------|---------|
| Google Cloud CLI (`gcloud`) | Latest | [cloud.google.com/sdk](https://cloud.google.com/sdk/docs/install) |
| Docker Desktop | 24+ | [docker.com](https://www.docker.com/products/docker-desktop) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Git | Any | [git-scm.com](https://git-scm.com) |

---

## Part 1 — Google Cloud Setup

### 1.1 Create a GCP Project

```bash
# Login to GCP
gcloud auth login

# Create a new project (or use existing)
gcloud projects create greensteps-india-prod --name="GreenSteps India"

# Set as active project
gcloud config set project greensteps-india-prod
```

### 1.2 Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  firebase.googleapis.com
```

### 1.3 Create Artifact Registry Repository

```bash
gcloud artifacts repositories create greensteps \
  --repository-format=docker \
  --location=asia-south1 \
  --description="GreenSteps India Docker images"
```

### 1.4 Authenticate Docker

```bash
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

---

## Part 2 — Database Setup (MongoDB Atlas)

### 2.1 Create MongoDB Atlas Account
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Sign up / Login
3. Click **"Build a Database"** → Choose **M0 Free Tier**
4. Select **AWS → Mumbai (ap-south-1)** region
5. Name cluster: `greensteps-cluster`

### 2.2 Configure Access
1. **Database Access** → Add new user:
   - Username: `greensteps-admin`
   - Password: Generate secure password (save it!)
   - Role: **Atlas admin**

2. **Network Access** → Add IP Address:
   - Click **"Allow Access from Anywhere"** → `0.0.0.0/0`
   - *(For production, restrict to Cloud Run IPs)*

### 2.3 Get Connection String
1. Click **"Connect"** → **"Drivers"**
2. Copy the connection string:
   ```
   mongodb+srv://greensteps-admin:<PASSWORD>@greensteps-cluster.xxxxx.mongodb.net/greensteps?retryWrites=true&w=majority
   ```
3. Replace `<PASSWORD>` with your actual password

---

## Part 3 — Firebase Setup

### 3.1 Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → Select your GCP project `greensteps-india-prod`
3. Enable Google Analytics → Continue

### 3.2 Enable Authentication
1. Firebase Console → **Authentication** → **Get started**
2. Enable **Email/Password** provider
3. Enable **Google** provider

### 3.3 Get Frontend Config
1. Firebase Console → **Project Settings** → **General**
2. Scroll to **"Your apps"** → Click **"</>"** (Web)
3. Register app name: `greensteps-web`
4. Copy the `firebaseConfig` object values

### 3.4 Get Backend Admin SDK
1. Firebase Console → **Project Settings** → **Service accounts**
2. Click **"Generate new private key"** → Download JSON file
3. Extract values from the JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

---

## Part 4 — GCP Secret Manager Setup

Store all secrets securely in GCP Secret Manager:

```bash
# MongoDB URI
echo -n "mongodb+srv://greensteps-admin:YOUR_PASSWORD@..." | \
  gcloud secrets create MONGO_URI --data-file=-

# JWT Secret (generate a random one)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" | \
  gcloud secrets create JWT_SECRET --data-file=-

# Firebase Admin SDK secrets
echo -n "greensteps-india-prod" | \
  gcloud secrets create FIREBASE_PROJECT_ID --data-file=-

echo -n "firebase-adminsdk-xxxxx@greensteps-india-prod.iam.gserviceaccount.com" | \
  gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file=-

# For private key, paste the entire key including BEGIN/END lines
gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=- <<'EOF'
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEA...
-----END PRIVATE KEY-----
EOF
```

Grant Cloud Run access to secrets:

```bash
# Get Cloud Run service account
PROJECT_NUMBER=$(gcloud projects describe greensteps-india-prod --format='value(projectNumber)')
SA="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

# Grant access to each secret
for SECRET in MONGO_URI JWT_SECRET FIREBASE_PROJECT_ID FIREBASE_CLIENT_EMAIL FIREBASE_PRIVATE_KEY; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:$SA" \
    --role="roles/secretmanager.secretAccessor"
done
```

---

## Part 5 — Deploy Backend to Cloud Run

```bash
# Build and push backend image
docker build -t asia-south1-docker.pkg.dev/greensteps-india-prod/greensteps/greensteps-api:latest ./backend
docker push asia-south1-docker.pkg.dev/greensteps-india-prod/greensteps/greensteps-api:latest

# Deploy to Cloud Run
gcloud run deploy greensteps-api \
  --image=asia-south1-docker.pkg.dev/greensteps-india-prod/greensteps/greensteps-api:latest \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=5000 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production,PORT=5000" \
  --set-secrets="MONGO_URI=MONGO_URI:latest,JWT_SECRET=JWT_SECRET:latest,FIREBASE_PROJECT_ID=FIREBASE_PROJECT_ID:latest,FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest,FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest"

# Get backend URL
BACKEND_URL=$(gcloud run services describe greensteps-api --region=asia-south1 --format='value(status.url)')
echo "Backend URL: $BACKEND_URL"
```

---

## Part 6 — Deploy Frontend to Cloud Run

```bash
# Build frontend image with actual backend URL
docker build \
  --build-arg VITE_API_URL=$BACKEND_URL/api/v1 \
  -t asia-south1-docker.pkg.dev/greensteps-india-prod/greensteps/greensteps-web:latest \
  ./frontend

docker push asia-south1-docker.pkg.dev/greensteps-india-prod/greensteps/greensteps-web:latest

# Deploy to Cloud Run
gcloud run deploy greensteps-web \
  --image=asia-south1-docker.pkg.dev/greensteps-india-prod/greensteps/greensteps-web:latest \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=80 \
  --memory=256Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=5

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe greensteps-web --region=asia-south1 --format='value(status.url)')
echo "✅ GreenSteps India is LIVE at: $FRONTEND_URL"
```

---

## Part 7 — GitHub Actions Automated CI/CD

### 7.1 Create Service Account for GitHub Actions

```bash
# Create service account
gcloud iam service-accounts create github-actions-sa \
  --display-name="GitHub Actions Service Account"

SA_EMAIL="github-actions-sa@greensteps-india-prod.iam.gserviceaccount.com"

# Grant required roles
for ROLE in roles/run.admin roles/cloudbuild.builds.builder roles/artifactregistry.writer roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding greensteps-india-prod \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE"
done

# Download SA key
gcloud iam service-accounts keys create gcp-sa-key.json \
  --iam-account=$SA_EMAIL
```

### 7.2 Add Secrets to GitHub Repository

Go to: **GitHub Repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value |
|-------------|-------|
| `GCP_PROJECT_ID` | `greensteps-india-prod` |
| `GCP_SA_KEY` | Contents of `gcp-sa-key.json` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Your random JWT secret |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK client email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK private key |

> ⚠️ Delete `gcp-sa-key.json` from your local machine after adding to GitHub!

### 7.3 Trigger Deployment

```bash
git add .
git commit -m "feat: configure production deployment"
git push origin main
```

The GitHub Actions workflow will automatically:
1. ✅ Run lint and build checks
2. 🐳 Build Docker images for backend + frontend
3. 📦 Push images to Artifact Registry
4. 🚀 Deploy both services to Cloud Run
5. 📋 Print live URLs in the Actions log

---

## Verification

After deployment, verify everything is working:

```bash
# Test backend health
curl $BACKEND_URL/health

# Test API
curl $BACKEND_URL/api/v1/leaderboard

# Visit frontend
echo "Open: $FRONTEND_URL"
```

---

## Estimated Costs (GCP Free Tier)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Cloud Run | 2M requests/month | Scales to zero when not in use |
| Artifact Registry | 0.5 GB free | Images are small (~50MB each) |
| Secret Manager | 6 active secrets free | We use 5 secrets |
| MongoDB Atlas | M0 free forever | 512MB storage |
| Firebase Auth | 10K verifications/month | Free for most projects |

**Estimated monthly cost: $0 for small-scale usage** 🎉
