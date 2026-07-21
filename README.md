# On My Way

Real-time GPS location sharing app. Create temporary rooms, share a code, and see each other's live location on an interactive map.

## Features

- Create temporary rooms with shareable codes (`XXXX-XXXX`)
- Real-time GPS location sharing via WebSocket
- Interactive Leaflet map with member markers
- Meeting point with distance and ETA calculations
- Viewer mode (watch without sharing location)
- Room auto-expiry (default 2 hours)
- Connection state indicators with ping/latency display

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Leaflet |
| Backend | Python, FastAPI, SQLAlchemy (async), aiosqlite |
| Database | SQLite (dev) / PostgreSQL (Docker) |
| Real-time | WebSocket |

## Getting Started

### Prerequisites

- Python 3.13+
- Node.js 20+

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Docker

```bash
docker compose up --build
```

## Environment Variables

Copy `.env.example` to both `backend/.env` and `frontend/.env` and adjust as needed.

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./onmyway.db` | Database connection string |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed CORS origins |
| `VITE_API_URL` | `http://localhost:8000` | API base URL (frontend) |
| `VITE_WS_URL` | `ws://localhost:8000` | WebSocket URL (frontend) |
