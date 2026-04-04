# Phase 5: The Edge AI Chat — Plan

## Plan 1: AI Sessions Schema & Server Actions

**Tasks:**
1. Create `ai_sessions` table for message history
2. Create `ai_messages` table for individual messages
3. Server action `chatWithSubject(subjectId, message)` — RAG + Groq streaming
4. Server action `getSessionHistory(studentId, subjectId)` — load past messages

## Plan 2: AI Chat UI Components

**Tasks:**
1. `src/components/ai/AIChatPanel.tsx` — Chat panel with streaming responses
2. `src/components/ai/ChatMessage.tsx` — Individual message with source citations
3. `src/components/ai/ChatInput.tsx` — Input with send button and loading state
4. Integrate AIChatPanel into student learning path page

## Verification
- Chat panel opens/closes smoothly
- RAG context is injected into system prompt
- Groq streams response token by token
- Source citations shown below each response
- Session history persists and loads correctly
