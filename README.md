# FanTwin AI 🤖🎙️

> **Autonomous fan engagement and monetization operating system for creators.**

FanTwin AI acts as a digital twin for top-tier creators. It automatically processes high-volume follower interactions, analyzes fan intent, predicts monetization value, learns a creator's writing style to draft custom responses, and organizes high-priority conversations in a sleek SaaS workspace.

This repository implements a **production-inspired asynchronous worker architecture** utilizing Redis queues, background job processors, WebSockets, and `pgvector`-based semantic tone retrieval (RAG).

---

## 🚀 Product Vision & Capabilities

Top creators receive thousands of comments, DMs, and emails daily across Instagram, YouTube, and X (formerly Twitter). The majority of these interactions are left unaddressed due to lack of time. FanTwin AI solves this by deploying a specialized, tone-learning AI twin that parses fan intent, detects high-value sponsor/business inquiries, estimates opportunity values, and generates context-aware replies matching the creator's voice.

*   **Durable Asynchronous Processing:** Redis-backed queues absorb message spikes instantly.
*   **Vector-RAG Tone Matching:** Utilizes PostgreSQL `pgvector` similarity queries to inject historical creator style samples directly into AI context.
*   **Real-Time Status Feeds:** Leverages native WebSockets to broadcast processed messages to the UI without aggressive short-polling.
*   **Production Fallbacks:** Integrates local heuristic rule classifiers and vector hashes to allow offline/local developer workflows without OpenAI credentials.

---

## 🛠️ System Architecture

FanTwin AI is structured as a decoupled, multi-container full-stack monorepo:

*   **`/frontend`**: Next.js 14 Client Dashboard (TypeScript, Tailwind CSS, Framer Motion, Recharts)
*   **`/backend`**: Node.js & Express REST API + WebSocket Server (TypeScript, Prisma ORM, pgvector PostgreSQL, OpenAI SDK, BullMQ)

### Core Ingest Flow
```mermaid
graph TD
    Client[Next.js Client] <-->|Real-Time WebSockets| Server[Express Server & WS host]
    Server -->|Enqueues Job| Queue[Redis BullMQ Queue]
    Queue -->|Worker Consumer| Worker[BullMQ Async Queue Worker]
    Worker -->|1. Generate Embedding| Embed[OpenAI Embedding Service / Local Hash]
    Worker -->|2. RAG Match| DB[(pgvector Database)]
    Worker -->|3. LLM Completions| OpenAI[OpenAI API / Heuristics]
    Worker -->|4. Persist Results| DB
    Worker -->|5. Broadcast Alert| Server
```

---

## 🧠 AI & Memory Architecture

### 1. Ingest & Classification Pipeline
When a message is ingested into the database:
1.  **Semantic Analysis:** The message's sentiment is parsed (`positive`, `neutral`, `negative`).
2.  **Category Segmentation:** Classified into profiles (`sponsor_inquiry`, `vip_supporter`, `potential_subscriber`, `loyal_fan`, `spam_troll`, `casual_follower`).
3.  **Priority Scoring:** Weighted from `0` to `100` (e.g. sponsorship inquiries receive priority `90+`).
4.  **Monetization Opportunity:** Detects budgets/deals, computes estimated values, and creates step-by-step action plans (e.g. "Send rate sheet").

### 2. pgvector RAG Tone Matching
To replicate the creator's distinct style:
```mermaid
sequenceDiagram
    participant Inbound as Follower Message
    participant Worker as BullMQ Worker
    participant Embed as Embedding Service
    participant DB as PostgreSQL (pgvector)
    participant LLM as OpenAI GPT-4o-mini

    Inbound->>Worker: Enqueue message text
    Worker->>Embed: Convert text to 1536-dimensional vector
    Embed-->>Worker: Return vector array
    Worker->>DB: SQL Query: SELECT similar content ORDER BY <=> (Cosine Distance) LIMIT 3
    DB-->>Worker: Return 3 historical tone samples
    Worker->>LLM: System instructions + Tone Rules + 3 RAG Exemplars + Inbound text
    LLM-->>Worker: Return Zod-validated classification & draft replies
```

### 3. Mock vs. Production AI Modes
To support local development and offline testing:
*   **Production Mode:** Connects to OpenAI completions (`gpt-4o-mini`) and embeddings (`text-embedding-3-small`).
*   **Mock Mode:** Automatically triggered if `OPENAI_API_KEY` is empty or if `MOCK_AI_PIPELINE=true` is set.
    *   *Heuristic Completions:* Evaluates text using regex matches to categorize categories and outputs template replies styled with the creator's top emojis.
    *   *Deterministic Vector Embeddings:* Generates normalized 1536-dimensional vectors using character hashes, ensuring SQL pgvector operations execute successfully offline.

---

## ⚡ Setup & Installation

### Prerequisites
*   [Node.js v18+](https://nodejs.org)
*   [Docker & Docker Compose](https://www.docker.com/)

---

### Step 1: Set Up Environments

Create a `.env` file in the `backend/` folder based on `.env.example`:

**Backend Environment (`backend/.env`)**
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/fantwin?schema=public"
OPENAI_API_KEY="" # Optional: Add OpenAI API key to enable live AI mode
MOCK_AI_PIPELINE=true # Set to true to bypass API key calls during development

# Redis Config (Used by BullMQ Workers)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Auth Configuration
JWT_SECRET="fantwin-jwt-secret-key-12345"
```

---

### Step 2: Spin Up Docker Containers (Postgres + Redis)

Start the local PostgreSQL (with pgvector support) and Redis containers:
```bash
docker-compose up -d
```

---

### Step 3: Run Database Migrations & Seeding

Install backend dependencies, generate the Prisma Client, push schemas to PostgreSQL, and seed mock data:
```bash
cd backend
npm install
npx prisma db push
npm run db:seed
```

The database is populated with:
*   A default creator **Alex Vance** (`alexvance_ai`)
*   A custom **Tone Profile**
*   Creator Memory style samples
*   Initial message threads

---

### Step 4: Boot Development Servers

Run the backend and frontend servers:

**Run the Backend API + WebSocket Server (`localhost:5000`)**
```bash
cd backend
npm run dev
```

**Run the Frontend Dashboard (`localhost:3000`)**
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Developer Dashboard Overview

The dashboard split-component structure is structured inside `/frontend/src/components`:
1.  **AI Inbox Feed:** Interactive feed filters (Platform, Category, Sentiment), priorities tags, diagnostic reasoning panels, monetization cards, and active reply editors (Save, Copy, Send response handles).
2.  **Tone Learning Center:** Configured metric breakdown bars, style rules, training sample upload forms, and playground testing fields.
3.  **Insights Analytics:** Total counts KPIs, Recharts trends curves, segment pies distribution, and value audit meters.

---

## 📈 Scalability Roadmap

1.  **Dead-Letter Queues (DLQ):** Route repeatedly failed queue jobs (e.g. rate-limit or API exhaustion failures) to a DLQ for administrator diagnostics.
2.  **Horizontal Scale Workers:** Deploy workers inside isolated serverless instances to consume Redis queues concurrently under heavy spikes.
3.  **Socket Authentication:** Secure real-time WebSocket client handshakes using JWT token validation middleware.
4.  **pgvector Indexes:** Create HNSW or IVFFlat indexes on `CreatorMemoryEmbedding` vectors to maintain low-latency similarity queries as memories scale.
