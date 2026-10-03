<div align="center">

<img src="https://img.shields.io/badge/DermaCheck-AI%20Skincare%20Screening-F2AFC0?style=for-the-badge&logo=react&logoColor=white" alt="DermaCheck" />

# 🌸 DermaCheck

**AI-powered cosmetic skin-concern screening app**

*A beauty & skincare guidance tool — not a medical device.*

[![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB?logo=react)](https://expo.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?logo=mongoose)](https://mongoosejs.com)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas%20M0%20Free-47A248?logo=mongodb)](https://mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini%202.5%20Flash-4285F4?logo=google)](https://ai.google.dev)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-F55036?logo=meta)](https://console.groq.com)

</div>

---

> ⚠️ **Disclaimer**: DermaCheck is a cosmetic guidance tool only. It is **NOT** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified dermatologist for medical concerns.

---

## ✨ What is DermaCheck?

DermaCheck lets you **photograph a skin area**, get an instant AI analysis of cosmetic concerns (e.g. acne, dryness, pigmentation), and receive a **personalised care card** with routine steps, recommended ingredients, and a friendly urgency assessment — all from your phone.

### Key Features

- 📸 **Photo Capture** — Take or upload photos of specific skin spots
- 🤖 **Gemini Vision Analysis** — Google Gemini 2.5 Flash classifies concern type & severity
- 💌 **Care Cards** — Groq Llama 3.3 70B generates warm, plain-language skincare guidance
- 📈 **Progress Tracking** — Monitor spots over time with a full photo history
- 💬 **AI Assistant** — Conversational skincare chat powered by Groq
- 🔐 **User Accounts** — Secure registration, login, and personal data storage

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│          React Native App (Expo)                │
│  Login · Signup · Home · Scan · History · Chat  │
└──────────────────┬──────────────────────────────┘
                   │  HTTP (React Query)
┌──────────────────▼──────────────────────────────┐
│         Express API Server (Node.js)            │
├──────────────┬──────────────┬───────────────────┤
│  Auth Routes │  Spot Routes │  Scan Pipeline    │
└──────────────┴──────┬───────┴────────┬──────────┘
                      │                │
        ┌─────────────▼──┐    ┌────────▼─────────────┐
        │ MongoDB Atlas   │    │  Google Gemini 2.5   │
        │ (Mongoose ODM)  │    │  Flash (Image → JSON)│
        └────────────────┘    └────────┬─────────────┘
                                       │  structured JSON
                              ┌────────▼─────────────┐
                              │  Groq Llama 3.3 70B  │
                              │  (Care Card Text)    │
                              └──────────────────────┘
```

### AI Pipeline

| Step | Service | Purpose |
|------|---------|---------|
| **1** | Google Gemini 2.5 Flash | Multimodal image analysis → `concernType`, `severity`, `description` |
| **2** | Groq Llama 3.3 70B | Structured JSON → friendly care card, routine steps, ingredient suggestions |
| **DB** | PostgreSQL via Drizzle ORM | Persist users, spots, photo entries, care cards |

---

## 📁 Project Structure

```
DermaCheck-mobile-app/
├── frontend/                          ← Monorepo root (pnpm workspaces)
│   ├── artifacts/
│   │   ├── derma-check/               ← 📱 React Native / Expo mobile app
│   │   │   ├── app/                   ← Expo Router screens
│   │   │   │   ├── index.tsx          ← Login screen
│   │   │   │   ├── signup.tsx         ← Sign-up screen
│   │   │   │   ├── assistant.tsx      ← AI chat screen
│   │   │   │   └── (tabs)/            ← Tab navigator
│   │   │   │       ├── home.tsx       ← Dashboard / recent activity
│   │   │   │       ├── scan.tsx       ← Camera + scan flow
│   │   │   │       ├── history.tsx    ← Spot history & care cards
│   │   │   │       └── profile.tsx    ← User profile
│   │   │   ├── components/            ← Shared UI components
│   │   │   ├── context/               ← Theme & auth context
│   │   │   └── constants/             ← Design tokens & theme
│   │   │
│   │   └── api-server/                ← 🖥️ Express backend
│   │       └── src/
│   │           ├── app.ts             ← Express app setup
│   │           ├── index.ts           ← Server entry point
│   │           ├── routes/            ← API route handlers
│   │           ├── middlewares/       ← Auth & validation middleware
│   │           └── lib/               ← AI clients, utilities
│   │
│   └── lib/
│       ├── db/                        ← 🗄️ Mongoose models (MongoDB Atlas)
│       ├── api-zod/                   ← 📐 Shared Zod validation schemas
│       ├── api-client-react/          ← 🔌 React Query hooks
│       └── api-spec/                  ← API specification
│
├── .gitignore                         ← Root gitignore (this file)
└── README.md                          ← You are here
```

---

## 🗄️ Database Collections

> Powered by **MongoDB Atlas M0** (free tier, 512 MB, no credit card, always online).
> No migrations needed — Mongoose handles schemas at the application layer.

| Collection | Key Fields |
|-------|----------|
| `users` | `_id`, `email`, `passwordHash`, `name`, `skinToneEstimate`, `createdAt` |
| `spots` | `_id`, `userId` (ref User), `label`, `bodyRegion`, `createdAt` |
| `photoentries` | `_id`, `spotId` (ref Spot), `imageUrl`, `capturedAt`, `concernType`, `severity`, `confidence` |
| `carecards` | `_id`, `photoEntryId` (ref PhotoEntry), `generatedText`, `routineSteps[]`, `ingredients[]`, `urgencyLevel` |

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive session token |
| `GET` | `/api/spots` | List all tracked spots for current user |
| `POST` | `/api/spots` | Create a new tracked skin spot |
| `POST` | `/api/spots/:id/scan` | Upload photo → Gemini analysis → Groq care card → save |
| `GET` | `/api/spots/:id/history` | Get all photo entries + care cards for a spot |
| `GET` | `/api/health` | Health check |

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| pnpm | ≥ 9 |
| PostgreSQL | ≥ 15 |
| Expo CLI | latest |

### 1. Clone the repo

```bash
git clone https://github.com/Abu-Hojayfa/DERMA.git
cd DERMA/frontend
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
```

Edit `artifacts/api-server/.env`:

```env
# Get your free Atlas connection string at https://mongodb.com/atlas (M0 = free forever)
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/dermacheck?retryWrites=true&w=majority

JWT_SECRET=replace-this-with-a-long-random-secret-string
GOOGLE_AI_API_KEY=AIza...   # https://aistudio.google.com
GROQ_API_KEY=gsk_...         # https://console.groq.com
PORT=3000
```

### 4. No database setup needed!

MongoDB Atlas is managed — just paste your `MONGODB_URI` and the collections are created automatically when data is first written.

> **Get a free Atlas cluster**: Go to [mongodb.com/atlas](https://mongodb.com/atlas), click "Try Free", create an M0 cluster (512 MB, no credit card), and copy the connection string.

### 5. Run the development servers

**Backend** (in one terminal):

```bash
pnpm --filter ./artifacts/api-server run dev
```

**Mobile app** (in another terminal):

```bash
pnpm --filter ./artifacts/derma-check run dev
# Then scan the QR code with Expo Go on your phone
```

---

## 🎨 Design System

DermaCheck uses a warm, cosmetic-inspired design language:

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#F2AFC0` Blush Pink | Buttons, highlights |
| Secondary | `#C9A8E0` Soft Lavender | Accents, tags |
| Background | `#FFF9F5` Warm Ivory | Page backgrounds |
| Accent | `#F5B896` Dusty Coral | Call-to-action |

**Design Principles:**
- Rounded corners (16–24 px radius) everywhere
- Soft drop shadows — no harsh borders
- Gentle fade/scale transitions
- Warm, conversational tone ("Let's take a look at that spot 🌸")

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native + Expo Router |
| API Server | Node.js + Express |
| Language | TypeScript 5.9 |
| ODM | Mongoose |
| Database | MongoDB Atlas (M0 free tier) |
| Package Manager | pnpm (workspaces) |
| Image AI | Google Gemini 2.5 Flash |
| Care Card AI | Groq — Llama 3.3 70B |
| Validation | Zod (shared schemas) |
| Data Fetching | React Query |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made with 🌸 by the DermaCheck team

</div>
