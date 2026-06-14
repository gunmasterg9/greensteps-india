# GreenSteps India — Project Structure

```
greensteps-india/
│
├── 📄 README.md                        # Project overview and quick start
├── 📄 API_DOCUMENTATION.md             # Full REST API reference
├── 📄 DEPLOYMENT_GUIDE.md              # Step-by-step GCP deployment guide
├── 📄 SETUP.md                         # Local development setup
├── 📄 PROJECT_STRUCTURE.md             # This file
│
├── 🐳 docker-compose.yml               # Local multi-container orchestration
├── 🚀 deploy.sh                        # Manual GCP Cloud Run deploy script
├── 📄 .gitignore                       # Git ignore rules
│
├── 📁 .github/
│   └── 📁 workflows/
│       └── ⚙️  deploy.yml             # GitHub Actions CI/CD pipeline
│
│─── 📁 backend/                        # Node.js + Express REST API
│    ├── 📄 package.json
│    ├── 📄 .env.example                # Environment variables template
│    ├── 🐳 Dockerfile                  # Production Docker image
│    ├── ⚙️  cloudbuild-backend.yaml    # GCP Cloud Build config
│    ├── ⚙️  cloudrun-service.yaml      # GCP Cloud Run service definition
│    └── 📁 src/
│        ├── 🟢 index.js               # Express server entry point
│        ├── 📁 config/
│        │   └── db.js                 # MongoDB connection + Mock DB
│        ├── 📁 middleware/
│        │   └── auth.js               # Firebase + Mock JWT authentication
│        ├── 📁 models/                # Mongoose schemas
│        │   ├── User.js
│        │   ├── Activity.js
│        │   └── Challenge.js
│        └── 📁 routes/               # Express route handlers
│            ├── auth.js              # POST /auth/login, GET /auth/me
│            ├── users.js             # GET/PUT /users/profile
│            ├── activities.js        # GET/POST /activities
│            ├── carbon.js            # POST /carbon/calculate
│            ├── challenges.js        # GET /challenges, POST /challenges/:id/join
│            ├── leaderboard.js       # GET /leaderboard
│            └── admin.js             # Admin-only routes
│
└── 📁 frontend/                        # React + Vite + Tailwind CSS
     ├── 📄 package.json
     ├── 📄 .env.example               # Environment variables template
     ├── 🐳 Dockerfile                 # Multi-stage Nginx production image
     ├── ⚙️  nginx.conf                # Nginx SPA routing + gzip config
     ├── ⚙️  cloudbuild-frontend.yaml  # GCP Cloud Build config
     ├── ⚙️  cloudrun-service.yaml     # GCP Cloud Run service definition
     ├── 🌐 index.html                 # HTML entry point (Outfit font, Leaflet CSS)
     ├── 📄 vite.config.js
     ├── 📄 tailwind.config.js         # Custom green brand color palette
     ├── 📄 postcss.config.js
     └── 📁 src/
         ├── 🟢 main.jsx               # React app mount point
         ├── 🟢 App.jsx                # Router + Protected routes
         ├── 📄 index.css              # Tailwind directives + glassmorphism
         ├── 📁 firebase/
         │   └── config.js             # Firebase SDK init with fallback detection
         ├── 📁 context/
         │   └── AuthContext.jsx       # Global auth state (Live + Mock)
         ├── 📁 utils/
         │   ├── carbonCalculator.js   # Indian emission factor math
         │   └── indiaData.js          # All 36 States/UTs + cities + programs
         └── 📁 components/
             ├── 📁 Auth/
             │   ├── Login.jsx         # Login page with mock quick-access
             │   └── Register.jsx      # Registration with state/city dropdowns
             ├── 📁 Layout/
             │   └── AppLayout.jsx     # Sidebar + responsive layout wrapper
             ├── 📁 Dashboard/
             │   └── DashboardView.jsx # Main dashboard with Recharts
             ├── 📁 Calculator/
             │   └── CalculatorView.jsx # Multi-step carbon footprint wizard
             ├── 📁 Tracker/
             │   └── TrackerView.jsx   # Activity logging + history table
             ├── 📁 Challenges/
             │   └── ChallengesView.jsx # Gamification + badge gallery
             ├── 📁 Community/
             │   └── CommunityView.jsx # Leaderboard + certificate sharing
             ├── 📁 CarbonMap/
             │   └── CarbonMapView.jsx # Leaflet India map with state data
             └── 📁 Admin/
                 └── AdminView.jsx     # Admin control panel
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Mock Mode** | Allows instant preview without Firebase/MongoDB setup |
| **Indian emission factors** | Localized for Indian power grid (0.82 kg CO₂/kWh), LPG cylinders (14.2kg), transit types |
| **Glassmorphism UI** | Modern premium aesthetic using `backdrop-blur` and subtle borders |
| **Nginx SPA routing** | Handles React Router paths correctly in production (`try_files $uri /index.html`) |
| **Non-root Docker user** | Security best practice for production containers |
| **GCP Secret Manager** | Secrets injected at runtime, never baked into images |
| **Asia-south1 region** | Mumbai region — lowest latency for Indian users |
