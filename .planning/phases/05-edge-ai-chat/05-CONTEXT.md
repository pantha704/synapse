# Phase 5: The Edge AI Chat — Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the AI chat interface alongside the mindmap for real-time, subject-aware conversations:
- Embed chat panel next to the learning path/mindmap canvas
- Connect to Groq for ultra-low latency inference (via Vercel AI SDK or direct Groq SDK)
- Wire RAG context: student query → subject-scoped vector search → inject context → Groq → streamed response
- Implement isolated session memory per subject to prevent context bleed
- Show "thinking" indicators and source citations from RAG chunks

</domain>

<decisions>
## Implementation Decisions

### LLM Provider
- Use Groq API directly (already integrated for embeddings)
- Model: llama-3.3-70b-versatile for fast, high-quality responses
- Streaming via Groq's streaming API or Vercel AI SDK for edge compatibility

### Chat Architecture
- Server action `chatWithAI(subjectId, messages)` — handles RAG + LLM call
- Client component `AIChatPanel` — chat UI with streaming responses
- Message history stored in `ai_sessions` table per student+subject
- RAG context injected as system prompt: "You are a helpful tutor for [Subject]. Use the provided context to answer."

### Session Memory
- `ai_sessions` table: {studentId, subjectId, messages JSON, createdAt}
- Max 10 messages per session (sliding window)
- Separate session per subject to prevent bleed
- Sessions expire after 24 hours

### UI Integration
- Chat panel as a slide-out drawer next to the learning path
- Collapsible to save screen space
- Shows source citations (which chunks were used)
- Loading skeleton during RAG retrieval + LLM response

### the agent's Discretion
- Streaming: Use Groq's native streaming for real-time token display
- Max tokens: 1024 per response (concise, focused answers)
- Temperature: 0.3 for educational consistency
- Session cleanup: Background job to delete sessions older than 24h

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/ai/embeddings.ts` — Groq client already configured
- `src/lib/ai/search.ts` — RAG context builder ready
- `src/app/actions/ai-actions.ts` — Server action pattern established
- AcademicLearningPath — main canvas where chat panel will overlay

### Integration Points
- Add AIChatPanel as overlay/side panel on learning path pages
- Create ai_sessions table for message history
- Connect chat to subject context via searchSubjectContext()

</code_context>

<specifics>
## Specific Ideas

- "Ask AI" floating button on each topic node
- Chat panel slides in from the right
- Show "Sources used" expandable section below each AI response
- Typing indicator while waiting for streamed response

</specifics>

<deferred>
## Deferred Ideas

- Voice input for chat
- Multi-turn reasoning chains
- AI-generated quiz questions from chat context

</deferred>
