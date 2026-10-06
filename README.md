# Recall AI - AI Document Q&A RAG Application

A production-quality document intelligence platform where users can upload documents, ask questions, and receive grounded answers with citations using Retrieval-Augmented Generation (RAG).

## Product Overview

**Recall AI** is a document intelligence SaaS that enables users to:

- **Upload and manage documents** (PDF, TXT, Markdown) with automatic text extraction, chunking, and embedding
- **Ask natural language questions** about their documents and receive precise, grounded answers
- **View citations and source passages** for every answer with expandable source excerpts
- **Organize conversations** with persistent chat history, renaming, and deletion
- **Track document processing status** with real-time updates
- **Secure multi-user access** with email/password and Google OAuth authentication

**Target audience**: Knowledge workers, researchers, students, and professionals who need to extract insights from large document collections.

## Architecture

### Frontend
- **Next.js 16** (App Router) with React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Client-side state management** with React hooks
- **Streaming responses** for real-time answer display

### Backend
- **Next.js API Routes** for RESTful endpoints
- **PostgreSQL** with **pgvector** for vector similarity search
- **Prisma ORM** for database access
- **Google Gemini 2.5 Flash** for LLM answer generation
- **FastAPI embedding service** (separate service) for text embeddings

### Data Flow (RAG Pipeline)

1. **Upload** → File validation → Secure storage → Text extraction
2. **Chunking** → Split text into overlapping chunks (configurable size/overlap)
3. **Embedding** → Generate vector embeddings via embedding service
4. **Storage** → Store chunks + embeddings in PostgreSQL with pgvector
5. **Query** → Embed user question → Hybrid search (vector + BM25) with ACL filtering
6. **Context Assembly** → Reciprocal Rank Fusion → Build grounded prompt
7. **Generation** → Stream answer from Gemini with `<Answer>` tag parsing
8. **Citation** → Store source chunk IDs, scores, model metadata with message

### Authentication & Authorization
- **Google OAuth** via `@react-oauth/google`
- **Email/Password** with bcrypt (12 rounds)
- **JWT sessions** in HttpOnly cookies (30-day expiry)
- **Row-level security** - all queries scoped to authenticated user
- **Document/Chat ownership** enforced at database level

## Features

### ✅ Implemented

- **Authentication**: Google OAuth + Email/Password registration & login
- **Document Upload**: Multi-format support (PDF, TXT, MD) with validation
- **Document Processing**: Status tracking (pending → extracting → chunking → embedding → ready)
- **Vector Search**: pgvector HNSW index + BM25 full-text with RRF fusion
- **Grounded Q&A**: Answers restricted to retrieved context with explicit "not enough info" handling
- **Citations**: Expandable source excerpts with relevance scores
- **Conversation History**: Persistent chats with titles, rename, delete
- **Document Management**: List, rename, retry failed, delete with cascade
- **Rate Limiting**: Configurable per-endpoint limits (uploads, questions, embeddings)
- **Responsive UI**: Works on desktop, tablet, mobile

### 🔄 In Progress / Planned

- OCR support for scanned PDFs
- Background job queue for document processing
- Webhook notifications
- Team workspaces with RBAC
- Export conversations (PDF/Markdown)

## Screenshots

*Add screenshots here when available. Placeholder structure:*

| Feature | Screenshot |
|---------|------------|
| Landing Page | ![Landing](docs/screenshots/landing.png) |
| Chat Interface | ![Chat](docs/screenshots/chat.png) |
| Document Panel | ![Documents](docs/screenshots/documents.png) |
| Citations | ![Citations](docs/screenshots/citations.png) |

## Local Setup

### Prerequisites

- **Node.js 20+** and **pnpm**
- **PostgreSQL 16+** with **pgvector** extension
- **Python 3.11+** for embedding service
- **Google Cloud Console** project for OAuth
- **Google AI Studio** API key for Gemini

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/ArmaanAmoli/ai-document-qna-rag-app.git
cd ai-document-qna-rag-app

# Install Node dependencies
pnpm install

# Install Python dependencies for embedding service
cd fastapi-server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 2. Database Setup

```bash
# Start PostgreSQL (adjust for your setup)
sudo service postgresql start

# Create database and enable pgvector
psql -U postgres -c "CREATE DATABASE rag_doc_qa;"
psql -U postgres -d rag_doc_qa -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Run migrations
pnpm prisma migrate deploy

# Generate Prisma client
pnpm prisma generate
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/rag_doc_qa` |
| `JWT_SECRET` | 32+ char random string | `openssl rand -hex 32` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `GOCSPX-xxx` |
| `GEMINI_API_KEY` | Google AI Studio API key | `AIzaSy...` |
| `EMBEDDING_SERVICE_URL` | FastAPI embedding service URL | `http://localhost:8001` |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | 32-char base64 key | `openssl rand -base64 32` |

### 4. Start Development Servers

```bash
# Terminal 1: Embedding service
cd fastapi-server && source venv/bin/activate && python -m uvicorn main:app --reload --port 8001

# Terminal 2: Next.js dev server
pnpm dev
```

Visit `http://localhost:3000`

## Environment Variables

See `.env.example` for complete list. Key categories:

| Category | Variables |
|----------|-----------|
| Database | `DATABASE_URL` |
| Auth | `JWT_SECRET`, `JWT_EXPIRY`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| LLM | `GEMINI_API_KEY`, `LLM_MODEL`, `LLM_MAX_TOKENS`, `LLM_TEMPERATURE` |
| Embeddings | `EMBEDDING_SERVICE_URL`, `EMBEDDING_DIMENSION`, `EMBEDDING_MODEL` |
| Processing | `CHUNK_SIZE`, `CHUNK_OVERLAP`, `MAX_UPLOAD_SIZE_MB`, `MAX_PAGES_PER_DOCUMENT` |
| Rate Limiting | `RATE_LIMIT_UPLOADS_PER_MINUTE`, `RATE_LIMIT_QUESTIONS_PER_MINUTE` |
| Cache | `REDIS_URL` |
| Observability | `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` |
| Security | `COOKIE_SECURE`, `COOKIE_SAME_SITE`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` |

All variables are validated at startup. Server-only variables are NOT prefixed with `NEXT_PUBLIC_`.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format` | Format with Prettier |
| `pnpm format:check` | Check formatting |
| `pnpm test` | Run Vitest unit tests |
| `pnpm prisma migrate dev` | Create & apply migration |
| `pnpm prisma migrate deploy` | Apply migrations (prod) |
| `pnpm prisma generate` | Generate Prisma client |
| `pnpm prisma studio` | Open Prisma Studio |

## Testing

```bash
# Unit tests
pnpm test

# Run specific test file
pnpm test src/lib/__tests__/chunk-text.test.ts
```

Current test coverage:
- `chunk-text.test.ts` - Text chunking logic
- `extract-text.test.ts` - PDF/TXT extraction
- `embedding.test.ts` - Embedding generation (requires embedding service)

## Deployment

### Required Services

- **PostgreSQL 16+** with `pgvector` extension
- **Redis** (optional - for caching)
- **Node.js 20+** runtime
- **Python 3.11+** for embedding service

### Build & Start

```bash
# Build
pnpm build

# Run migrations
pnpm prisma migrate deploy

# Start production server
pnpm start
```

### Docker (Example)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./ 
COPY --from=builder /app/.next/static ./.next/static
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "server.js"]
```

### Database Migration

```bash
# On deploy
pnpm prisma migrate deploy

# Verify
pnpm prisma db pull
```

### Health Checks

- `GET /api/health` - Basic health (add implementation)
- `GET /api/ready` - Readiness with DB check (add implementation)

### Background Processing

The embedding service runs separately. In production, consider:
- **Redis + BullMQ** for job queue
- **Systemd/Supervisor** for process management
- **Kubernetes CronJob** for reconciliation

## Security

- **Authentication**: JWT in HttpOnly, Secure, SameSite=Lax cookies
- **Authorization**: Every API route validates ownership via Prisma
- **File Upload**: MIME + extension validation, size limits, sanitized filenames, SHA-256 content hashing
- **SQL Injection**: Parameterized queries via Prisma `$queryRaw` with tagged templates
- **XSS**: React auto-escaping, `react-markdown` with safe rendering
- **Prompt Injection**: System prompt isolates context, `<Answer>` tag enforcement
- **Rate Limiting**: In-memory (dev) / Redis (prod) per-endpoint limits
- **CSP Headers**: Configure in `next.config.ts`
- **Secrets**: Never committed, loaded from `.env` only

## Data Model

Key Prisma models:

- **User** - id, email, name, passwordHash, tenantId, roles
- **Chat** - id, userId, title, tenantId
- **Message** - id, chatId, content, isHuman, index, sourceChunkIds[], retrievalScores[], modelVersion
- **Document** - id, chatId, name, type, size, status, pageCount, chunkCount, contentHash
- **DocumentChunk** - id, documentId, content, embedding(vector), chunkIndex, contentTsVector
- **AuditLog** - Full query/answer traceability

Vector index: HNSW on `DocumentChunk.embedding` (384-dim)
Full-text index: GIN on `DocumentChunk.contentTsVector`

## Known Limitations

- **OCR**: Scanned PDFs not supported (text extraction fails)
- **Background Jobs**: Document processing runs inline (blocks request)
- **Durable Queue**: No persistent job queue for retries
- **Multi-tenancy**: Schema supports `tenantId` but UI is single-tenant
- **File Storage**: Local filesystem only (not S3/GCS)
- **Model Failover**: Single LLM/embedding provider
- **Billing/Usage**: Tracking implemented but no quotas enforced

## Contributing

1. Fork & create feature branch
2. Make small, focused commits with conventional messages
3. Run `pnpm lint`, `pnpm format:check`, `pnpm test`
4. Open PR with description of changes

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with Next.js, PostgreSQL, pgvector, and Google Gemini.
For questions, open an issue on GitHub.