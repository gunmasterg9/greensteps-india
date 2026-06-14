# 🌿 GreenSteps India

> **Calculate, Track & Reduce Your Carbon Footprint** — Built for Indian Citizens

[![CI/CD](https://github.com/gunmasterg9/greensteps-india/actions/workflows/deploy.yml/badge.svg)](https://github.com/gunmasterg9/greensteps-india/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![GCP](https://img.shields.io/badge/Deploy-GCP%20Cloud%20Run-blue)](DEPLOYMENT_GUIDE.md)

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](SETUP.md) | Local development setup (3 options: Mock/Firebase/Docker) |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Full GCP Cloud Run deployment guide |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | REST API reference for all endpoints |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Annotated file tree and architecture |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧮 **Carbon Calculator** | Calculate CO₂ from transport, electricity, LPG, food, shopping, waste — using Indian emission factors |
| 📊 **Dashboard** | Monthly trend charts (Recharts), category breakdown, personalized tips |
| 📍 **India Map** | Leaflet + OpenStreetMap choropleth showing state-wise carbon intensity |
| 📝 **Activity Tracker** | Log daily activities and track your progress over time |
| 🏆 **Challenges & Badges** | Join sustainability challenges and earn gamification badges |
| 🥇 **Community Leaderboard** | Compare your score with citizens across all Indian states |
| 🛡️ **Admin Panel** | Manage users, export CSV reports, create challenges |
| ⚡ **Mock Mode** | Works instantly without any database/Firebase setup |

---

## 🗺️ India Coverage

All **28 States + 8 Union Territories** supported with:
- Searchable state + city dropdowns
- State-specific emission intensity factors
- Local government sustainability programs
- Regional recommendations

---

## 🚀 Quick Start (60 seconds)

```bash
# 1. Clone
git clone https://github.com/gunmasterg9/greensteps-india.git
cd greensteps-india

# 2. Start Backend
cd backend && npm install && npm run dev

# 3. Start Frontend (new terminal)
cd frontend && npm install && npm run dev

# 4. Open http://localhost:3000
# Click "Standard Citizen" to login instantly — no setup needed!
```

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI framework + fast dev server |
| Tailwind CSS | Utility-first styling with glassmorphism |
| Recharts | Dashboard charts and graphs |
| Leaflet + OpenStreetMap | Interactive India carbon map |
| React Router v6 | Client-side routing |
| Axios | API communication |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js 18 + Express | REST API server |
| MongoDB Atlas + Mongoose | Database (with in-memory fallback) |
| Firebase Admin SDK | Token verification (with mock fallback) |
| JWT | Developer authentication tokens |
| CORS + Helmet | Security middleware |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Docker + Nginx | Production container images |
| GCP Cloud Run | Serverless container hosting |
| GCP Artifact Registry | Docker image storage |
| GCP Secret Manager | Secure secrets storage |
| GitHub Actions | CI/CD pipeline |
| MongoDB Atlas | Managed database (Mumbai region) |
| Firebase Auth | User authentication |

---

## 🌱 Indian Emission Factors Used

| Category | Factor | Source |
|----------|--------|--------|
| Electricity Grid | 0.82 kg CO₂/kWh | CEA (Central Electricity Authority) 2023 |
| Petrol | 2.31 kg CO₂/litre | MoPNG India |
| Diesel | 2.68 kg CO₂/litre | MoPNG India |
| LPG Cylinder (14.2kg) | 37.68 kg CO₂ | PCRA India |
| CNG | 1.96 kg CO₂/kg | PCRA India |
| Air Travel | 0.255 kg CO₂/km | ICAO Calculator |
| Non-veg meal | 3.3 kg CO₂/meal | FAO |
| Veg meal | 0.5 kg CO₂/meal | FAO |

---

## 📁 Project Structure

```
greensteps-india/
├── backend/          ← Express API + MongoDB + Firebase Auth
├── frontend/         ← React + Vite + Tailwind
├── .github/          ← GitHub Actions CI/CD
├── SETUP.md          ← Local development guide
├── DEPLOYMENT_GUIDE.md ← GCP deployment guide
└── docker-compose.yml  ← Local Docker orchestration
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for the full annotated file tree.

---

## 🚢 Deploy to GCP

See the full [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) or use the quick deploy script:

```bash
# Make sure gcloud CLI is authenticated first
chmod +x deploy.sh
./deploy.sh
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feat/my-feature`
3. Commit changes: `git commit -m 'feat: add my feature'`
4. Push to branch: `git push origin feat/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with 💚 for a Greener India 🇮🇳
</div>
