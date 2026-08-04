# ♻️ Rebinit — AI-Powered Waste Management & Recycling Platform

Rebinit is a full-stack web application that helps communities report illegal dumping, log personal recycling activity, trade recyclable materials, and earn redeemable rewards — all backed by a custom-trained AI model that classifies waste from a photo in real time.

**Live demo:** [rebinit.vercel.app](https://rebinit.vercel.app) 

---

## Features

### 🤖 AI Waste Classification
A MobileNetV2 CNN, fine-tuned via two-phase transfer learning on a custom 8-category dataset (paper, plastic, organic, glass, e-waste, metal, textile, trash), achieving **86% validation accuracy**. Every photo upload gets an instant prediction with confidence score, recyclability status, hazard warnings, and disposal guidance.

### 🚮 Report Dumping (Civic Reporting)
Flag illegal dumping sites near you with a photo, mandatory geolocation, and severity level. Reports go through a status pipeline (`Reported → In Progress → Resolved`) that admins manage from a dedicated dashboard.

### ♻️ My Recycling (Personal Log)
A separate, simpler flow for logging your own recycling activity — no location or admin review needed, just instant classification and category-based points.

### 🛒 Marketplace
Buy and sell recyclable materials with real search, category/location/price filtering, and direct seller contact (phone/email) — no fake "add to cart," just a realistic peer-to-peer contact flow.

### 🏆 Rewards & Redemption
Earn points from reporting and recycling, climb a live leaderboard, and redeem points for real discount vouchers from a seeded partner catalog — complete with unique code generation and a full earn/spend transaction history.

### 🗺️ Interactive Map
Leaflet-powered map showing collection points and geotagged reports, with an admin-managed points catalog (no more manual SQL inserts).

### 🛡️ Admin Dashboard
Role-gated dashboard with Recharts analytics (reports over time, by category, by status), user management, listing moderation, and CSV export.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), React Router, Recharts, Leaflet |
| Backend | Node.js, Express |
| Database | MySQL (Aiven) |
| ML Service | Python, Flask, TensorFlow/Keras (MobileNetV2 transfer learning) |
| Auth | JWT, bcrypt |
| Image Storage | Cloudinary |
| Deployment | Vercel (frontend), Render (backend + ML service), Aiven (MySQL) |

---

## Architecture

```
client/       React frontend (Vite)
server/       Express API — auth, reports, recycling, listings,
              rewards, redemptions, map, admin, notifications
ml-service/   Flask microservice — waste classification via a
              custom-trained CNN, runs independently of the main API
```

The ML service is deliberately decoupled from the main backend — the Node API calls it over HTTP, the same way it would call any third-party inference API. This keeps the Python/ML environment isolated from the Node/Express environment and makes each piece independently deployable and scalable.

---

## Running locally

**1. Database**
```bash
mysql -u root -p < server/schema.sql
```

**2. Backend**
```bash
cd server
npm install
# create a .env file — see server/.env.example for required variables
npm run dev
```

**3. ML service**
```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

**4. Frontend**
```bash
cd client
npm install
npm run dev
```

---

## Training the classifier

The `ml-service/` folder includes the full training pipeline, not just the trained model:

- `merge_dataset.py` — merges and balances source image folders into train/val splits
- `train.py` — two-phase transfer learning (frozen head training, then fine-tuning the top layers of MobileNetV2 at a reduced learning rate)

Dataset: a merged set combining the public [Garbage Classification](https://www.kaggle.com/datasets/mostafaabla/garbage-classification) dataset with a separate e-waste dataset, rebalanced to ~400 images per class.

---

## Author

**Bongaram Varun Reddy**
[LinkedIn](https://linkedin.com/in/varun-reddy-bongaram) · [GitHub](https://github.com/BVarunReddy)