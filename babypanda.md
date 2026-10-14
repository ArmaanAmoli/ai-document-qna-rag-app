# Productionize and Expand the AI Document Q&A RAG Application

You are working in the existing GitHub repository:

`ArmaanAmoli/ai-document-qna-rag-app`

Repository:
- Owner: `ArmaanAmoli`
- Repository: `ai-document-qna-rag-app`
- Default branch: `main`
- Stack described by the repository: Next.js, TypeScript, PostgreSQL, pgvector, and LLM integrations
- Product: AI Document Q&A using Retrieval-Augmented Generation

Your task is to transform the existing application into a production-quality, polished, secure, reliable, and feature-rich product.

Work autonomously. Do not repeatedly ask for approval or clarification. First inspect the repository thoroughly, understand what already exists, and then implement the improvements using the current architecture wherever practical.

Do not blindly rewrite the application. Preserve working functionality, improve existing patterns, and make incremental, reviewable changes.

---

# 1. Primary objective

Turn the current application into a complete document intelligence product where users can:

- Create an account or securely access the application.
- Upload and manage documents.
- Organize documents into collections or workspaces.
- Track document processing status.
- Search across their documents.
- Ask questions about one or more documents.
- Receive grounded answers based on retrieved document content.
- View citations and source passages.
- Continue conversations about their documents.
- Rename, download, retry, and delete documents.
- Understand when an answer is uncertain or unsupported.
- Use the product comfortably on desktop, tablet, and mobile.
- Recover gracefully from upload, processing, database, embedding, and LLM failures.

The finished project should look and behave like a real SaaS product rather than a demo or proof of concept.

---

# 2. Important working rules

## 2.1 Inspect before modifying

Before changing code:

- Inspect the complete repository structure.
- Review all source files, routes, components, database code, migrations, scripts, configuration, styles, tests, and documentation.
- Identify the current framework version and package versions.
- Identify the current authentication approach, if any.
- Identify the current storage provider or local file-storage approach.
- Identify the current document parser and supported formats.
- Identify how embeddings are generated.
- Identify how vectors are stored and queried.
- Identify how prompts are built.
- Identify whether processing is synchronous or asynchronous.
- Identify the current deployment assumptions.
- Locate TODOs, mock implementations, placeholder data, debug logging, incomplete flows, and unsafe behavior.
- Run the existing validation commands before changing code where possible.

Use the existing architecture when it is sound. Refactor only when necessary to improve correctness, security, maintainability, or production readiness.

## 2.2 Do not create one giant commit

This is a strict requirement.

Make small, focused, logically grouped commits throughout the implementation.

Do not put hundreds or thousands of unrelated lines into one commit.

Each commit should:

- Have one clear purpose.
- Be independently understandable.
- Avoid mixing unrelated refactors with feature work.
- Include tests for the behavior it introduces where practical.
- Be easy to review, revert, or cherry-pick.
- Use a clear conventional commit-style message.

Preferred commit examples:

- `chore: audit existing application structure`
- `chore: improve environment validation`
- `feat: add authenticated user model`
- `feat: add document ownership constraints`
- `feat: improve document upload validation`
- `feat: add document processing status tracking`
- `feat: add retryable ingestion pipeline`
- `feat: improve vector retrieval filtering`
- `feat: add grounded answer citations`
- `feat: add conversation history`
- `feat: improve document management UI`
- `test: cover upload authorization and validation`
- `test: add retrieval and prompt construction tests`
- `docs: document local setup and deployment`

Keep commits reasonably small. As a general guideline, aim for approximately 1–5 related files or one clearly scoped feature per commit when practical. A larger commit is acceptable only when the files are inseparable for the same change.

Before each commit:

1. Review the diff.
2. Remove unrelated changes.
3. Run the most relevant tests or checks.
4. Commit only the completed logical unit.
5. Continue with the next logical unit.

Do not squash all implementation work into one giant commit at the end.

Do not make unrelated formatting changes across the entire repository unless required for the task.

Do not commit generated build artifacts, secrets, local databases, uploads, or temporary debugging files.

## 2.3 Branch and pull request behavior

- Work on a dedicated feature branch based on `main`.
- Do not modify the `main` branch directly.
- Keep the branch history readable.
- Open a pull request when the implementation is complete.
- The pull request should summarize the feature, architecture changes, database changes, tests, deployment requirements, and remaining limitations.
- Include a concise list of the logical commits in the pull request description.

---

# 3. Product architecture and user experience

Improve the application so it has a coherent SaaS-style structure.

At minimum, review and improve:

- Landing page.
- Authentication pages.
- Application dashboard.
- Workspace or document-library page.
- Upload interface.
- Document detail page.
- Chat or question-answer page.
- Conversation history.
- Settings page.
- Error and not-found pages.
- Loading and empty states.
- Mobile navigation.
- Notifications and confirmation dialogs.

Use the existing component library and design conventions where available. Do not add an unnecessary UI framework if the project already has a suitable system.

Create a consistent visual language:

- Clear typography hierarchy.
- Consistent spacing.
- Consistent border radius and shadows.
- Consistent button variants.
- Consistent form controls.
- Consistent error, warning, success, and informational states.
- Professional empty states.
- Responsive layouts.
- Accessible focus states.
- Useful hover and active states.
- Good contrast in light and dark themes if dark mode exists.

---

# 4. Authentication, users, and authorization

If authentication already exists, audit and strengthen it. If it does not exist, implement a secure authentication foundation compatible with the current Next.js application.

Implement or improve:

- User registration and login where appropriate.
- Secure session handling.
- Logout.
- Password reset or a clearly documented external authentication flow.
- Secure cookie configuration.
- Session expiration and refresh behavior.
- Protection for authenticated routes.
- Protection for API routes and server actions.
- User-scoped database access.
- Authorization checks at the data-access layer, not only in the UI.
- Safe handling of unauthenticated and unauthorized requests.
- Consistent `401` and `403` responses.

Every document, collection, conversation, message, chunk, and processing job must be associated with an owner or workspace.

Prevent:

- Accessing another user's documents by changing an ID in the URL.
- Cross-user vector retrieval.
- Cross-user conversation access.
- Cross-user file downloads.
- Cross-user deletion.
- Cross-user processing retries.
- Inference of private metadata through error responses.

Add reusable authorization helpers so ownership checks are not duplicated inconsistently.

---

# 5. Workspaces, collections, and document organization

Add a useful organization model if the current application does not already have one.

Support, where compatible with the existing product:

- Personal workspace.
- Document collections or folders.
- Collection names and descriptions.
- Adding documents to collections.
- Moving documents between collections.
- Filtering documents by collection.
- Search within a collection.
- Selecting one or more documents for a question.
- Collection-level authorization.
- Collection deletion behavior.
- Empty states for collections.

Do not overcomplicate the permission model unless the existing application already targets teams. If a multi-user workspace model is introduced, support a clear minimum model such as:

- Owner.
- Member.
- Read-only member.

Document all permission behavior in the README.

---

# 6. Document upload and file management

Build a reliable document-management experience.

## Supported files

Inspect the existing implementation and preserve intended formats. Support common text-extractable files where practical, such as:

- PDF.
- TXT.
- Markdown.
- DOCX, if the existing architecture supports it safely.

Do not claim support for a format unless the parser and pipeline actually handle it.

## Upload validation

Implement:

- MIME-type validation.
- Extension validation.
- File-size limits.
- Page-count limits where applicable.
- Empty-file rejection.
- Malformed-file handling.
- Filename normalization.
- Safe server-side storage keys.
- Protection against path traversal.
- Protection against duplicate submissions.
- Checksum or content hash calculation.
- Configurable limits through environment variables.
- Meaningful validation errors.

Never trust the original filename as a storage path.

Never expose internal storage paths to the browser.

## Document metadata

Store useful metadata, including where available:

- ID.
- Owner or workspace ID.
- Original filename.
- Safe display filename.
- MIME type.
- File size.
- Checksum.
- Page count.
- Extracted character count.
- Chunk count.
- Embedding status.
- Processing status.
- Processing error.
- Upload timestamp.
- Last updated timestamp.
- Completion timestamp.
- Current ingestion version.

## Document actions

Support:

- Upload.
- Rename.
- View details.
- Download if permitted.
- Retry processing.
- Cancel processing where safe.
- Delete.
- Bulk delete with confirmation.
- Filter by processing state.
- Sort by name, size, date, and status.
- Pagination or bounded loading.
- Search by filename.
- Display processing progress or stage information.

Deletion must clean up related chunks, embeddings, metadata, conversations if appropriate, and stored files according to the product's retention policy.

---

# 7. Document ingestion pipeline

Create a clear, reliable ingestion pipeline:

1. Validate the upload.
2. Persist document metadata.
3. Store the file.
4. Extract text.
5. Normalize extracted text.
6. Preserve page or section metadata.
7. Split text into chunks.
8. Generate embeddings.
9. Store chunks and vectors.
10. Mark the document as ready.
11. Make the document available for search and Q&A.

Use explicit processing states such as:

- `pending`
- `uploading`
- `extracting`
- `chunking`
- `embedding`
- `indexing`
- `ready`
- `failed`
- `deleting`
- `deleted`

Requirements:

- Processing must be retryable.
- Retrying must be idempotent.
- Failed jobs must not remain stuck forever.
- Duplicate chunks must not be created during retries.
- Duplicate embeddings must not be created during retries.
- Concurrent processing of the same document must be prevented or safely coordinated.
- Errors must be persisted in a user-safe form.
- Internal stack traces must be logged server-side only.
- The UI must show what failed and provide a retry action.
- Processing must not silently report success before vectors are actually indexed.
- Long-running work must not block a request unnecessarily.

If the current deployment environment cannot support a durable queue, create a clean processing abstraction with a safe current implementation and document how it can later be moved to a worker or queue.

Where possible, support:

- Job IDs.
- Retry counts.
- Backoff.
- Maximum attempts.
- Processing timestamps.
- Failure categories.
- Cleanup for abandoned jobs.

---

# 8. Text extraction, chunking, and metadata

Improve extraction and chunking quality.

Requirements:

- Preserve page numbers for PDFs.
- Preserve headings or section labels when available.
- Normalize whitespace without destroying meaningful structure.
- Avoid creating useless empty chunks.
- Avoid splitting in the middle of important structures when possible.
- Configure chunk size and overlap.
- Make chunking deterministic.
- Store chunk order.
- Store source page or section metadata.
- Store a preview or safe excerpt for citations.
- Handle documents with no extractable text.
- Handle scanned PDFs gracefully by reporting that OCR is required if OCR is not implemented.
- Do not send entire documents to the LLM when only relevant chunks are needed.

Add tests for:

- Empty documents.
- Short documents.
- Long documents.
- Multiple pages.
- Repeated headings.
- Unicode text.
- Large whitespace blocks.
- Chunk overlap.
- Metadata preservation.

---

# 9. Embeddings and pgvector

Audit the vector database implementation carefully.

Implement or improve:

- Correct pgvector extension setup.
- Correct embedding dimension handling.
- Consistent embedding provider configuration.
- Configurable embedding model.
- Consistent distance metric.
- Appropriate vector indexes.
- Metadata indexes.
- User/workspace/document filtering.
- Bounded top-k retrieval.
- Similarity threshold filtering.
- Safe handling of missing vectors.
- Provider timeout handling.
- Provider rate-limit handling.
- Retry behavior for transient failures.
- Clear provider error messages.
- Idempotent embedding generation.

Do not hardcode embedding dimensions in multiple files.

Define configuration in one validated place.

Ensure a user's question can never retrieve another user's chunks, even if document IDs or collection IDs are manipulated.

Use transactions or carefully coordinated writes so chunks and embeddings remain consistent.

---

# 10. Search and retrieval

Add or improve document search.

Support, where practical:

- Filename search.
- Full-text search over extracted text.
- Semantic vector search.
- Hybrid retrieval if it can be implemented cleanly.
- Search within a selected collection.
- Search within selected documents.
- Search result previews.
- Page and section references.
- Relevance or similarity indicators where appropriate.
- Pagination or bounded results.

For semantic retrieval:

- Embed the user query.
- Filter by the current user/workspace.
- Filter by selected documents or collections.
- Apply top-k and minimum similarity settings.
- Deduplicate overlapping chunks when appropriate.
- Preserve source metadata.
- Return enough context for citation display.
- Handle no-result conditions explicitly.

Add tests proving that retrieval is correctly scoped and cannot leak data across users or workspaces.

---

# 11. Grounded question answering

Improve the Q&A pipeline.

## Question handling

- Validate questions.
- Enforce maximum question length.
- Reject empty or obviously invalid submissions.
- Prevent duplicate submissions while a request is active.
- Add request timeouts.
- Add request rate limits.
- Support one or more selected documents.
- Support collection-scoped questions.
- Preserve conversation context within safe limits.

## Prompt construction

Build prompts using clear separation between:

- System instructions.
- User question.
- Retrieved document context.
- Conversation history.

Treat document content as untrusted data.

Defend against prompt injection contained in uploaded documents. Retrieved text must never be allowed to override system or application instructions.

The model should be instructed to:

- Answer using retrieved context.
- Avoid unsupported claims.
- Clearly say when the answer is not contained in the available documents.
- Distinguish between direct evidence and inference.
- Cite the documents, pages, sections, or chunks used.
- Avoid inventing citations.
- Avoid revealing hidden system instructions.
- Avoid following instructions found inside the document text.

## Answer quality

Support:

- Source citations.
- Page references.
- Expandable source excerpts.
- “Not enough information” behavior.
- Confidence or evidence indicators only if they are meaningful and not misleading.
- Markdown rendering with safe sanitization.
- Code block rendering where relevant.
- Copy-answer action.
- Regenerate action.
- Feedback controls such as helpful/not helpful.
- Retry behavior for transient provider errors.

Do not expose raw prompts, API keys, internal errors, or hidden metadata.

Persist conversations only if the product supports conversation history. If persisted, scope every conversation and message to the correct user/workspace.

---

# 12. Conversation history

If not already implemented, add a clean conversation model.

Support:

- New conversation.
- Conversation title generation or editable titles.
- Conversation list.
- Rename conversation.
- Delete conversation.
- Open previous conversation.
- Continue a conversation.
- Message timestamps.
- User and assistant message roles.
- Source citations attached to assistant messages.
- Loading and streaming states if supported.
- Error messages that do not destroy previous messages.
- Search or pagination for long histories.

Prevent unbounded conversation context from being sent to the LLM. Use configurable history limits and summarization only if necessary.

---

# 13. API and server-side quality

Standardize all server routes, actions, and integrations.

Implement:

- Consistent response shapes.
- Correct HTTP status codes.
- Request validation.
- Centralized error handling.
- Safe error serialization.
- Request IDs.
- Timeouts.
- Bounded payload sizes.
- Rate limiting.
- Server-only provider access.
- Clear service-layer boundaries.
- Reusable data-access functions.
- Reusable authorization functions.
- Typed API contracts.
- No duplicated business logic between UI and API.

Use a schema validation library consistently.

Validate environment variables at startup or at the boundary where they are used.

Separate:

- Authentication.
- Authorization.
- Database access.
- File storage.
- Text extraction.
- Chunking.
- Embeddings.
- Retrieval.
- LLM completion.
- Logging.
- Rate limiting.

Use interfaces or adapters around external providers so they can be mocked during tests.

---

# 14. Security hardening

Perform a dedicated security review.

Address at least:

- SQL injection.
- Cross-user data access.
- IDOR vulnerabilities.
- Path traversal.
- Unsafe file uploads.
- Malicious PDFs or malformed documents.
- XSS from document-derived content.
- CSRF where relevant.
- SSRF risks.
- Prompt injection.
- Secret leakage.
- Insecure cookies.
- Missing authorization checks.
- Excessive request sizes.
- Excessive LLM usage.
- Unbounded database queries.
- Unbounded conversation history.
- Missing rate limits.
- Information leakage through errors.
- Logging of sensitive document content.
- Public access to private files.
- Unsafe redirects.
- Dependency vulnerabilities.

Add security headers where compatible, such as:

- Content Security Policy.
- Strict Transport Security in production.
- X-Content-Type-Options.
- Referrer-Policy.
- Frame protections.
- Permissions Policy where appropriate.

Do not make a security claim in the README unless it reflects the actual implementation.

---

# 15. Rate limiting, abuse prevention, and cost controls

Protect expensive operations.

Add configurable controls for:

- Upload requests.
- Total uploaded bytes per user or workspace.
- Document processing retries.
- Embedding requests.
- Questions per minute.
- Maximum question length.
- Maximum retrieved chunks.
- Maximum response tokens.
- Maximum conversation history.
- Maximum documents selected per question.
- Maximum file size.
- Maximum pages per document.

Return friendly errors when limits are exceeded.

Make rate limiting work with the current deployment environment. If an in-memory limiter is only suitable for local development, document that limitation and isolate it behind an abstraction.

Track useful usage information where appropriate:

- Upload count.
- Uploaded bytes.
- Processed documents.
- Questions asked.
- Provider errors.
- Estimated token usage.
- Processing duration.

Do not introduce billing unless the existing repository already contains billing requirements. However, keep usage tracking extensible.

---

# 16. Observability and operations

Add production-friendly observability.

Implement:

- Structured server logs.
- Request IDs.
- Job IDs.
- Processing stage logs.
- Provider latency logs.
- Error categories.
- Safe logging with sensitive-content redaction.
- Health endpoint.
- Readiness endpoint if useful.
- Database connectivity check.
- Provider configuration check without exposing secrets.
- Processing failure visibility.
- Useful server diagnostics.

Do not log:

- API keys.
- Passwords.
- Session tokens.
- Full uploaded documents.
- Full sensitive prompts by default.
- Private file URLs.
- Unredacted authorization headers.

Add clear operational documentation for:

- Database setup.
- pgvector setup.
- Storage setup.
- LLM provider setup.
- Embedding provider setup.
- Required environment variables.
- Migrations.
- Background processing.
- Failure recovery.
- Backups.
- Data deletion.

---

# 17. Database and migrations

Review the full data model.

Ensure:

- All important tables have appropriate primary keys.
- Foreign keys are present.
- Cascading behavior is intentional.
- Ownership relationships are enforced.
- Unique constraints prevent duplicate records.
- Timestamps are consistent.
- Status fields use safe values.
- Indexes support common queries.
- Vector indexes use the correct configuration.
- User-scoped queries are efficient.
- Pagination is possible.
- Orphaned records are prevented or cleaned.
- Migrations work against a fresh database.
- Migrations are safe to run in the documented order.
- Rollback considerations are documented where appropriate.

Add migrations for any schema changes.

Do not manually modify production schema without a migration.

If seed data is added, ensure it is development-only and contains no secrets or private data.

---

# 18. Frontend accessibility and UX

The application must be usable with:

- Keyboard navigation.
- Screen readers.
- Mobile viewport sizes.
- Slow networks.
- Failed requests.
- Long filenames.
- Large document lists.
- Long answers.
- Empty accounts.
- Partially processed documents.

Implement:

- Accessible labels.
- Correct button semantics.
- Form error announcements.
- Focus management.
- Loading announcements.
- Confirmation dialogs for destructive actions.
- Non-color-only status indicators.
- Keyboard-accessible dropdowns and dialogs.
- Safe Markdown rendering.
- Truncated text with accessible expansion.
- Responsive tables or cards.
- Skeleton loading states.
- Optimistic updates only when rollback is reliable.

Ensure the interface does not show a successful answer while retrieval or generation is still in progress.

---

# 19. Testing requirements

Add meaningful tests without relying on paid external services.

## Unit tests

Cover:

- Environment validation.
- File validation.
- MIME and extension validation.
- Filename sanitization.
- Storage-key generation.
- File-size limits.
- Chunking.
- Page metadata handling.
- Embedding configuration.
- Retrieval filters.
- Similarity thresholds.
- Prompt construction.
- Prompt-injection-resistant context formatting.
- Answer parsing.
- Error mapping.
- Authorization helpers.
- Rate-limit behavior.

## Integration tests

Cover:

- Authenticated upload.
- Unauthenticated upload rejection.
- Unauthorized document access rejection.
- Valid and invalid file uploads.
- Document processing success.
- Document processing failure.
- Retry behavior.
- Idempotent ingestion.
- Vector insertion.
- User-scoped retrieval.
- Document deletion and cleanup.
- Question answering with relevant context.
- Question answering with no relevant context.
- Provider timeout behavior.
- Provider failure behavior.
- Conversation persistence and authorization.

## End-to-end tests

If the repository supports browser testing, add a critical-path test:

1. Visit the application.
2. Authenticate using a test account or test fixture.
3. Upload a sample document.
4. Observe processing status.
5. Wait until the document is ready.
6. Ask a question whose answer is present in the document.
7. Verify that the answer is displayed.
8. Verify that at least one source citation is displayed.
9. Ask a question whose answer is not present.
10. Verify that the application communicates insufficient evidence.
11. Delete the document.
12. Verify that it is no longer available.

Add an authorization test proving that a second user cannot access the first user's document.

Use mocks and fixtures for external LLM, embedding, storage, and email providers.

---

# 20. Performance and scalability

Review the application for production performance.

Improve:

- Database query efficiency.
- Pagination.
- Streaming where it is reliable.
- File upload handling.
- Memory usage during extraction.
- Batch embedding requests.
- Vector query performance.
- Avoidance of N+1 queries.
- Client bundle size.
- Image optimization.
- Server-side caching where safe.
- Debounced search.
- Cancellation of stale requests.
- Retry behavior.
- Processing concurrency.

Do not optimize prematurely at the expense of correctness, security, or maintainability.

---

# 21. Configuration and environment variables

Create or improve `.env.example`.

Every environment variable must include:

- Name.
- Purpose.
- Whether it is required.
- Example format.
- Whether it is server-only.
- Safe development default if one exists.

Typical categories include:

- Database URL.
- Authentication secrets.
- LLM provider and model.
- Embedding provider and model.
- Embedding dimension.
- File storage provider.
- Storage bucket or directory.
- Upload limits.
- Processing limits.
- Retrieval settings.
- Rate limits.
- Application URL.
- Logging level.
- Optional observability settings.

Never commit real credentials.

Ensure client-exposed environment variables are deliberately prefixed and contain no secrets.

---

# 22. README requirements

Update `README.md` substantially and keep it synchronized with the implementation.

The README must contain:

## Product overview

- What the application does.
- Who it is for.
- Main product capabilities.
- Important limitations.

## Feature list

Document implemented features only, including:

- Authentication.
- Uploads.
- Supported file types.
- Collections or workspaces.
- Processing status.
- Semantic search.
- Q&A.
- Citations.
- Conversation history.
- Document management.
- Security controls.
- Rate limits.
- Observability.

## Screenshots

- Add screenshots if available.
- If screenshots are not available, add clearly labeled placeholders and explain where they should be replaced.

## Architecture

Explain:

- Frontend.
- Server routes or server actions.
- Database.
- pgvector.
- File storage.
- Text extraction.
- Chunking.
- Embedding generation.
- Retrieval.
- LLM answer generation.
- Authentication.
- Processing jobs.

## RAG pipeline

Document the complete flow:

1. Upload.
2. Validation.
3. Storage.
4. Text extraction.
5. Chunking.
6. Embedding generation.
7. pgvector indexing.
8. Query embedding.
9. Similarity search.
10. Context assembly.
11. Grounded answer generation.
12. Citation display.

## Local setup

Include exact commands for:

- Cloning.
- Installing dependencies.
- Creating environment variables.
- Starting PostgreSQL.
- Installing or enabling pgvector.
- Running migrations.
- Seeding development data if supported.
- Starting the development server.

## Environment variables

Include a complete table of variables and descriptions.

## Commands

Document exact commands for:

- Development.
- Production build.
- Production start.
- Lint.
- Formatting.
- Typechecking.
- Unit tests.
- Integration tests.
- End-to-end tests.
- Database migrations.
- Database reset or local cleanup if supported.

## Deployment

Document:

- Required services.
- Database deployment.
- File storage deployment.
- LLM and embedding provider configuration.
- Environment variables.
- Build command.
- Start command.
- Migration process.
- Background processing requirements.
- Health checks.
- Common deployment pitfalls.

## Security

Document:

- Authentication.
- Authorization.
- File validation.
- Prompt injection handling.
- Data isolation.
- Secret handling.
- Rate limiting.
- Data deletion behavior.

## Troubleshooting

Include solutions for:

- Database connection failures.
- pgvector missing.
- Invalid provider credentials.
- Embedding dimension mismatch.
- Documents stuck processing.
- Unsupported files.
- Empty extracted text.
- LLM rate limits.
- Storage failures.
- Build and migration errors.

## Known limitations

Be honest about anything not fully supported, such as:

- OCR.
- Durable background workers.
- Multi-region deployment.
- Advanced team permissions.
- Billing.
- Enterprise SSO.
- Provider failover.

Do not document features that are not implemented.

---

# 23. Suggested implementation sequence

Use this sequence as a guide, but adapt it after inspecting the repository.

Create separate small commits for each logical unit:

1. Repository audit and baseline validation.
2. Environment and configuration validation.
3. Database schema and migration improvements.
4. Authentication and session hardening.
5. Authorization and ownership helpers.
6. File validation and secure storage improvements.
7. Document metadata and processing state model.
8. Text extraction improvements.
9. Deterministic chunking and metadata preservation.
10. Embedding provider abstraction.
11. pgvector indexing and retrieval improvements.
12. User-scoped semantic search.
13. Grounded prompting and citation support.
14. Question-answering error handling.
15. Conversation history.
16. Document management actions.
17. Collections or workspace organization.
18. Rate limiting and cost controls.
19. Structured logging and health checks.
20. Frontend dashboard improvements.
21. Upload and processing UX improvements.
22. Chat and citation UX improvements.
23. Accessibility improvements.
24. Unit tests.
25. Integration tests.
26. End-to-end tests.
27. README and environment documentation.
28. Final lint, typecheck, test, build, and security cleanup.

Do not force every item if it conflicts with the existing architecture. If a feature is already implemented, improve and test it instead of duplicating it.

---

# 24. Validation before completion

Before declaring the work complete:

- Run formatting.
- Run lint.
- Run TypeScript typechecking.
- Run unit tests.
- Run integration tests.
- Run end-to-end tests if configured.
- Run the production build.
- Verify database migrations on a clean database if possible.
- Verify the application starts using documented commands.
- Check for leaked secrets.
- Check `.gitignore`.
- Check `.env.example`.
- Check all API routes for authorization.
- Check all document and vector queries for user/workspace scoping.
- Check file deletion behavior.
- Check retry behavior.
- Check empty, loading, and error states.
- Check mobile responsiveness.
- Check keyboard accessibility.
- Review the final diff for unrelated changes.
- Review every commit for accidental large unrelated modifications.
- Confirm that the README accurately matches the implementation.

If a check cannot run because an external provider or deployment service is unavailable:

- Do not fake a successful result.
- Record the exact command.
- Explain why it could not run.
- Add mocks or local alternatives where practical.
- Document the limitation in the README.

---

# 25. Final deliverables

The final pull request must contain:

- Production-quality application code.
- Secure authentication and authorization.
- Reliable document upload and ingestion.
- Correct pgvector retrieval.
- Grounded answers with citations.
- Good loading, empty, and error states.
- Responsive and accessible UI.
- Database migrations.
- Tests for critical behavior.
- Updated configuration and `.env.example`.
- Updated scripts.
- Updated README.
- Small, logically organized commits.

The final response should include:

1. Summary of major changes.
2. Architecture overview.
3. Feature list.
4. Database and migration changes.
5. Security improvements.
6. Testing performed.
7. Exact commands run and their results.
8. Commit-by-commit summary.
9. Deployment instructions or changes.
10. Remaining limitations and recommended follow-up work.

Do not claim that a check passed unless it actually passed.

Do not leave obvious TODOs, placeholder success responses, debug logs, fake data, or unfinished production paths.

---

# 26. Issues Discovered During Codebase Exploration

The following issues were identified during thorough inspection of the repository that are NOT already documented in the existing notes (bug_fix_log, production_rag_plan, rag_sota_plan, MEMORY). These should be addressed as part of the productionization effort.

## Critical Security & Data Integrity

### 1. Message Model Field Persistence Bug (CRITICAL)
- **Files**: `src/types/chat.types.ts`, `src/lib/db/queries/message_queries/create_message.ts`, `src/app/api/chat/route.ts`
- **Issue**: The Prisma `Message` model includes fields `sourceChunkIds`, `sourceDocumentIds`, `retrievalScores`, `modelVersion`, `promptVersion`, `latencyMs`, `tokenUsage`, but:
  - TypeScript `Message` type is missing `sourceDocumentIds` field
  - `createNewMessage` function ONLY inserts `id, content, index, chatId, isHuman` - all new fields are lost
  - Chat route sets `messageAgent.sourceChunkIds`, `retrievalScores`, `modelVersion`, `promptVersion` but they're never persisted
- **Impact**: Source citations, retrieval scores, model version tracking, latency, and token usage are never stored

### 2. Document Download Not Implemented (CRITICAL)
- **File**: `src/app/api/documents/[id]/route.ts` (GET)
- **Issue**: Returns 501 "File download not fully implemented - file storage path not tracked"
- **Root cause**: Document model doesn't store file path; uploads saved to `public/uploads/` with generated name but path not recorded
- **Impact**: Users cannot download uploaded documents

### 3. Chat Page Broken - Empty chatId (CRITICAL)
- **File**: `src/app/chat/page.tsx`
- **Issue**: `chatId` hardcoded to empty string `""`
- **Impact**: All chat API calls will fail; no conversation persistence; cannot load existing messages

### 4. No Conversation Context in LLM Prompt (HIGH)
- **File**: `src/app/api/chat/route.ts`
- **Issue**: Only sends current question + retrieved context; previous conversation messages not included
- **Impact**: Multi-turn conversations don't work; LLM has no memory of prior Q&A

## Functional Correctness

### 5. PDF Page Count Not Extracted (HIGH)
- **Files**: `src/lib/text_utils/load-pdf-file.ts`, `src/lib/text_utils/extract-text.ts`
- **Issue**: `loadPDF` returns only text; `extractText` returns `pageCount: undefined` for PDFs
- **Impact**: Document metadata incomplete; page references in citations won't work

### 6. Missing Dynamic Chat Route (HIGH)
- **Files**: `src/app/chat/page.tsx` (should be `src/app/chat/[id]/page.tsx`)
- **Issue**: No route parameter for chat ID; cannot load specific conversation
- **Impact**: Users can't continue previous conversations; no shareable chat URLs

### 7. Rate Limiter Not Production-Ready (HIGH)
- **File**: `src/lib/rate-limit.ts`
- **Issue**: Uses in-memory `Map` - fails with multiple instances, serverless, or after restart
- **Impact**: Rate limiting ineffective in production; no persistence across deployments

### 8. No Request Timeout for LLM Calls (HIGH)
- **File**: `src/app/api/chat/route.ts`
- **Issue**: `generateContentStream` has no timeout; can hang indefinitely
- **Impact**: Requests can block forever on slow/unresponsive LLM provider

### 9. No Circuit Breakers for External Services (HIGH)
- **Directory**: `src/lib/resilience/` (empty)
- **Issue**: No resilience patterns for embedding service, vector DB, or LLM provider
- **Impact**: Cascading failures; no graceful degradation

### 10. Missing Health/Readiness Endpoints (MEDIUM)
- **Issue**: No `/healthz`, `/readyz` endpoints for load balancer/probe checks
- **Impact**: Cannot monitor service health in production

### 11. OpenTelemetry Never Initialized (MEDIUM)
- **Files**: `src/lib/observability/otel.ts`, `src/app/layout.tsx`
- **Issue**: `initOtel()` defined but never called
- **Impact**: Distributed tracing not active

### 12. Langfuse Not Integrated Into Chat Flow (MEDIUM)
- **Files**: `src/lib/observability/langfuse.ts`, `src/app/api/chat/route.ts`
- **Issue**: Langfuse client created but `createRagTrace`/`createSpan` never used in chat route
- **Impact**: No LLM observability, cost tracking, or quality monitoring

### 13. No Prompt Injection Protection (HIGH)
- **File**: `src/app/api/chat/route.ts`
- **Issue**: User question and retrieved document content directly interpolated into prompt without sanitization
- **Impact**: Malicious documents could inject instructions overriding system prompt

### 14. Hardcoded Model Name (MEDIUM)
- **Files**: `src/app/api/chat/route.ts`, `src/lib/observability/langfuse.ts`
- **Issue**: `'gemini-2.5-flash'` hardcoded in multiple places
- **Impact**: Cannot switch models without code changes; not configurable

### 15. No Token Usage Tracking (MEDIUM)
- **Files**: `src/app/api/chat/route.ts`, Prisma schema
- **Issue**: `Message.tokenUsage` field exists but never populated
- **Impact**: Cannot track costs or enforce token budgets

### 16. No Latency Tracking (MEDIUM)
- **Files**: `src/app/api/chat/route.ts`, Prisma schema
- **Issue**: `Message.latencyMs` field exists but never populated
- **Impact**: Cannot monitor performance or detect regressions

### 17. No Audit Logging (MEDIUM)
- **Files**: Prisma schema (`AuditLog` model), chat route
- **Issue**: AuditLog model defined but nothing writes to it
- **Impact**: No audit trail for compliance/debugging

### 18. Missing Document Status in UI (MEDIUM)
- **Files**: Document model has `status` field (pending/uploading/extracting/chunking/embedding/indexing/ready/failed/deleting/deleted) but no UI surfaces this
- **Impact**: Users can't see processing progress; stuck documents appear broken

### 19. Synchronous Document Processing Blocks Upload (MEDIUM)
- **File**: `src/app/api/upload/route.ts`
- **Issue**: Full ingestion pipeline (extract → chunk → embed → index) runs in request handler
- **Impact**: Large documents timeout; poor UX; no retry visibility

### 20. Content Hash Calculated But Not Used for Deduplication (LOW)
- **Files**: `src/app/api/upload/route.ts`, `insertDocInDatabase`
- **Issue**: `contentHash` computed but not checked before ingestion
- **Impact**: Duplicate documents create duplicate chunks/embeddings

## Code Quality & Maintainability

### 21. Console.log Statements Throughout Production Code (LOW)
- **Files**: Multiple (chat/route.ts, embedding.ts, chunk-text.ts, insert-doc-in-database.ts, upload/route.ts, etc.)
- **Issue**: Debug logging left in production paths
- **Impact**: Log noise; potential sensitive data leakage

### 22. Potential XSS in Citations Component (MEDIUM)
- **File**: `src/components/Citations.tsx`
- **Issue**: `chunk.content` rendered directly in `<div>` without sanitization
- **Impact**: If chunk contains HTML/JS, could execute in browser context

### 23. Google OAuth Callback Doesn't Update Existing Users (LOW)
- **File**: `src/app/api/auth/callback/route.ts`
- **Issue**: Creates new user if not found, but never updates name/email for existing users
- **Impact**: User profile stale after profile changes in Google

### 24. No Password Reset Flow (MEDIUM)
- **Issue**: Only email/password login and Google OAuth; no forgot/reset password
- **Impact**: Users locked out if they forget password

### 25. No Email Verification (MEDIUM)
- **Issue**: Registered users can immediately access app without verifying email
- **Impact**: Fake accounts; no reliable contact channel

### 26. No Session Refresh Mechanism (MEDIUM)
- **Issue**: JWT expires in 30 days; no refresh token; user logged out abruptly
- **Impact**: Poor UX; forces re-authentication

### 27. Missing Tenant/ACL Filtering in Some Queries (HIGH)
- **Files**: Various query files
- **Issue**: Not all vector/text searches consistently apply `tenantId` and `aclGroups` filters
- **Impact**: Potential cross-tenant data leakage

### 28. Inconsistent Prisma Import Paths (LOW)
- **Files**: Multiple
- **Issue**: Mix of `@/generated/prisma/client` and relative imports
- **Impact**: Maintenance burden; potential build issues

### 29. Message Index Collision Risk (HIGH)
- **File**: `src/app/api/chat/route.ts`
- **Issue**: `idx` comes from client; concurrent requests can use same index; no unique constraint on (chatId, index)
- **Impact**: Message ordering corruption; duplicate index errors

### 30. No Request ID / Correlation ID (LOW)
- **Issue**: No request ID generated or propagated through logs/traces
- **Impact**: Difficult to debug production issues across services

### 31. No Structured Logging (LOW)
- **Issue**: Uses `console.log`/`console.error` with unstructured strings
- **Impact**: Cannot parse/filter logs in production log aggregation

### 32. No Input Sanitization for Filenames in Citations (LOW)
- **File**: `src/components/Citations.tsx`
- **Issue**: `documentName` from database rendered directly in UI
- **Impact**: Potential XSS if malicious filename stored

### 33. Missing Unique Constraint on Document contentHash (LOW)
- **File**: Prisma schema
- **Issue**: `contentHash` field exists but no unique index
- **Impact**: Cannot efficiently prevent duplicate ingestion at DB level

### 34. No Chunk Deduplication Across Documents (LOW)
- **Issue**: Identical chunks across documents create duplicate embeddings
- **Impact**: Wasted storage; slower retrieval

### 35. Embedding Service No Retry Logic (MEDIUM)
- **File**: `src/lib/text_utils/embedding.ts`
- **Issue**: Single attempt with timeout; no exponential backoff retry
- **Impact**: Transient failures cause document processing to fail

### 36. No Maximum Conversation History Limit (MEDIUM)
- **File**: `src/app/api/chat/route.ts`
- **Issue**: Could send unbounded history to LLM (though currently sends none - see #4)
- **Impact**: Token budget exceeded; latency increase

### 37. No Streaming Error Recovery (MEDIUM)
- **File**: `src/app/api/chat/route.ts`
- **Issue**: If stream errors mid-way, partial message saved; no retry
- **Impact**: Incomplete answers persisted; user sees broken message

### 38. Missing Database Migration for Vector Indexes (HIGH)
- **File**: Prisma schema (comments mention HNSW/GIN indexes via migration)
- **Issue**: No migration file found creating vector/text search indexes
- **Impact**: Vector search will be slow (sequential scan) without HNSW index

### 39. No Document Processing Job Abstraction (MEDIUM)
- **Issue**: Processing logic inline in upload route; not extractable to worker/queue
- **Impact**: Cannot scale processing; blocks API requests

### 40. No Graceful Degradation for Vector DB Failure (MEDIUM)
- **Issue**: If pgvector unavailable, entire Q&A fails; no BM25-only fallback
- **Impact**: Single point of failure

## Architecture Gaps vs. babypanda.md Requirements

### 41. No Workspaces/Collections (P0 per spec)
- **Spec**: Section 5 requires workspaces, collections, document organization
- **Current**: Only chat-scoped documents; no collections

### 42. No Landing Page Beyond Auth (P0 per spec)
- **Spec**: Section 3 requires landing page, dashboard, document library
- **Current**: Only auth page and chat page

### 43. No Document Management UI (P0 per spec)
- **Spec**: Section 6 requires rename, view details, download, retry, delete, filter, sort, paginate, search
- **Current**: Only rename/delete/retry API endpoints; no UI

### 44. No Document Processing Status UI (P0 per spec)
- **Spec**: Section 7 requires explicit processing states with progress
- **Current**: Status field in DB but no UI

### 45. No Section-Aware Chunking (P0 per spec)
- **Spec**: Section 8 requires preserving headings/sections
- **Current**: Simple character-based chunking with space breaking

### 46. No Hybrid Search (P0 per spec)
- **Spec**: Section 10 requires hybrid retrieval
- **Current**: `searchContent.ts` implements hybrid but chat route may not use optimally

### 47. No Source Citations in Answers (P0 per spec)
- **Spec**: Section 11 requires citations, page references, expandable excerpts
- **Current**: Citations component exists but `sourceDocumentIds` not populated; page numbers missing

### 48. No "Not Enough Information" Behavior (P0 per spec)
- **Spec**: Section 11 requires explicit insufficient-evidence response
- **Current**: Prompt says to say this but not verified; no UI distinction

### 49. No Conversation Search/Pagination (P0 per spec)
- **Spec**: Section 12 requires search/pagination for long histories
- **Current**: Loads all messages for a chat

### 50. No Security Headers (P0 per spec)
- **Spec**: Section 14 requires CSP, HSTS, X-Content-Type-Options, etc.
- **Current**: None configured

### 51. No Usage/Cost Tracking (P0 per spec)
- **Spec**: Section 15 requires tracking uploads, questions, tokens, costs
- **Current**: TokenUsage field exists but unused

### 52. No Structured Server Logs (P0 per spec)
- **Spec**: Section 16 requires structured logs, request IDs, safe logging
- **Current**: console.log only

### 53. No Health/Readiness Endpoints (P0 per spec)
- **Spec**: Section 16 requires health endpoint, DB connectivity check
- **Current**: None

### 54. No Accessibility Features (P0 per spec)
- **Spec**: Section 18 requires keyboard nav, screen readers, ARIA
- **Current**: Basic semantic HTML but no focus management, announcements, etc.

### 55. No Tests (P0 per spec)
- **Spec**: Section 19 requires unit, integration, e2e tests
- **Current**: Only one embedding test

### 56. No README Updates (P0 per spec)
- **Spec**: Section 22 requires comprehensive README
- **Current**: Minimal README

### 57. No .env.example (P0 per spec)
- **Spec**: Section 21 requires complete .env.example
- **Current**: .env.example exists but may be incomplete

### 58. No Multi-Tenant ACL Enforcement Verification (P0 per spec)
- **Spec**: Section 4 requires user-scoped queries, prevention of cross-user access
- **Current**: Partial implementation; needs audit

### 59. No Prompt Injection Defense Verification (P0 per spec)
- **Spec**: Section 11 requires defense against prompt injection in retrieved text
- **Current**: No sanitization; direct interpolation

### 60. No PII Detection (P0 per spec)
- **Spec**: Section 1 Phase 1 requires PII detection on ingestion
- **Current**: Not implemented

---

## Summary of Immediate Priorities

Based on severity and dependency order:

1. **Fix Message persistence** (createNewMessage must save all fields)
2. **Fix chat page routing** (dynamic [id] route, load existing messages)
3. **Implement document download** (store file path in Document model)
4. **Add conversation context to LLM prompt**
5. **Extract PDF page count**
6. **Add request timeout for LLM**
7. **Implement prompt injection protection**
8. **Initialize OpenTelemetry and integrate Langfuse**
9. **Replace in-memory rate limiter with Redis abstraction**
10. **Add health/readiness endpoints**
11. **Create document processing job abstraction**
12. **Add HNSW/GIN indexes via migration**
13. **Implement structured logging with request IDs**
14. **Add password reset and email verification**
15. **Build document management UI with status tracking**
16. **Implement workspaces/collections**
17. **Add comprehensive test suite**
18. **Update README and .env.example**
19. **Configure security headers**
20. **Implement accessibility improvements