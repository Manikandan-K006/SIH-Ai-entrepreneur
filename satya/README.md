# SATYA — Smart AI for Transforming Your Aspirations
### Hyper-Local Business & Financial Assistant for Rural Micro-Entrepreneurs

Designed around SIH26091: **“AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant for Rural Micro-Entrepreneurs.”**

SATYA is an integrated full-stack rural entrepreneurship ecosystem that helps micro-entrepreneurs understand business opportunities, build business plans, structure finances, discover government support, and connect with mentors, suppliers, buyers, SHGs, and local financial institutions.

---

## 🚀 Core Features

1. **AI Business Advisor (SATYA AI):** Interactive advisor supporting text and voice in English, Tamil, and Hindi. Intelligently classifies query intents (business, financial, scheme, market, or networking).
2. **Business Idea Validation:** Outputsfeasibility status, Strengths, Weaknesses, Risks, Opportunities (SWOT), and target customer segments.
3. **Business Plan Generator:** Outputs a 10-section professional plan including operational structures and a 30/60/90-day roadmap. Printable to PDF.
4. **Financial AI Module:** Mathematical calculator for Project Costs, Own vs. Loan ratio, Break-even units/time, Gross margins, 12-month projections, and an EMI simulator.
5. **Government Scheme Intelligence (RAG):** Cosine-similarity text search against official PDF/Word scheme publications (e.g. PM-FME, MUDRA, NSFDC, TAHDCO) showing verified eligibility, required documents, application process, and source citations.
6. **Hyper-Local Market Intelligence:** Calculates an Opportunity Score based on local demand levels, transport, seasonality, raw materials availability, and competitor clusters.
7. **Explainable AI Matching Engine:** Ranks local mentors, raw input suppliers, wholesale buyers, and NGOs/SHGs with transparent matching percentages.
8. **Communication Layer:** Direct messaging, notifications count bell, and connection requests.
9. **Observe AI Execution Trace:** Transparent simplified panel showing "How SATYA analyzed this" (Intents, Agents used, Tools triggered, Confidence metrics).
10. **Admin Dashboard:** Portal analytics, user suspensions, and AI trace logs.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Recharts, Lucide React icons, Web Speech API (voice input).
- **Backend:** FastAPI, Python 3.11, SQLAlchemy 2.0, Uvicorn, Passlib (bcrypt), python-jose (JWT).
- **Database:** PostgreSQL + pgvector (co-located in container).
- **AI Integration:** OpenAI GPT-4o-mini (chat) & text-embedding-3-small (RAG).

---

## 📦 Getting Started & Setup

### Prerequisites
- Docker & Docker Compose
- OpenAI API Key (Configure in `.env`)

### 1. Configure Environment Variables
Copy the backend environment example:
```bash
cp backend/.env.example backend/.env
```
Open `backend/.env` and insert your `OPENAI_API_KEY`:
```env
OPENAI_API_KEY=sk-proj-YOUR-OPENAI-KEY-HERE
```

### 2. Run the Ecosystem via Docker Compose
Build and run the entire suite (PostgreSQL + pgvector, FastAPI Backend, Next.js Frontend):
```bash
docker compose up --build -d
```
Verify containers are healthy:
```bash
docker compose ps
```

### 3. Setup Database & Seed Demo Data
To initialize schema tables and seed our comprehensive mock dataset (20 entrepreneurs, 10 mentors, 15 suppliers, 10 buyers, 5 SHGs, 10 schemes):
```bash
# Seed databases inside backend container
docker compose exec backend python seed.py
```

### 4. Open the App in Your Browser
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **FastAPI OpenAPI Interactive Documentation:** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

## 🧪 Testing

To run the automated test suite verifying financial math calculations and EMI projections:
```bash
# Set PYTHONPATH and execute pytest
PYTHONPATH=. pytest tests/
```

---

## 🔑 Demo Credentials (Seeded)

- **Entrepreneur Profile:**
  - Email: `demo@satya.ai`
  - Password: `Demo@1234`
  - Context: Pickle & spice food processing in Salem, Tamil Nadu with ₹2,00,000 capital.
- **Portal Administrator:**
  - Email: `admin@satya.ai`
  - Password: `Admin@1234`
