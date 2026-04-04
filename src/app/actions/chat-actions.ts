'use server';

import { prisma } from '@/lib/prisma';
import { buildRAGContext } from '@/lib/ai/search';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || "",
});

const CHAT_MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 1024;
const TEMPERATURE = 0.3;
const MAX_HISTORY = 10;

export async function chatWithSubject(
  supabaseUserId: string,
  subjectId: string,
  userMessage: string
) {
  // Get or create session
  let session = await prisma.aiSession.findUnique({
    where: { studentId_subjectId: { studentId: supabaseUserId, subjectId } }
  });

  if (!session) {
    session = await prisma.aiSession.create({
      data: {
        studentId: supabaseUserId,
        subjectId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });
  }

  // Get subject name for context
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { name: true }
  });

  // Build RAG context
  const rag = await buildRAGContext(subjectId, userMessage);

  // Get recent message history
  const recentMessages = await prisma.aiMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: 'desc' },
    take: MAX_HISTORY
  });

  // Build messages array for Groq
  const systemPrompt = `You are a helpful AI tutor for the subject "${subject?.name || 'this course'}". 
Use the provided context from course materials to answer questions accurately. 
If the context doesn't contain the answer, say so honestly. 
Keep responses concise and educational. Cite sources when using specific information.

Context from course materials:
${rag.formattedContext || 'No relevant context found.'}`;

  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...recentMessages.reverse().map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage }
  ];

  // Call Groq API
  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    stream: false,
  });

  const assistantMessage = response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

  // Save messages to database
  await prisma.aiMessage.create({
    data: {
      sessionId: session.id,
      role: 'user',
      content: userMessage
    }
  });

  await prisma.aiMessage.create({
    data: {
      sessionId: session.id,
      role: 'assistant',
      content: assistantMessage,
      sources: rag.chunks.length > 0 ? JSON.stringify(rag.chunks.map(c => ({
        content: c.content.substring(0, 200),
        score: c.score
      }))) : null
    }
  });

  // Clean up expired sessions
  await prisma.aiSession.deleteMany({
    where: { expiresAt: { lt: new Date() } }
  });

  return {
    response: assistantMessage,
    sources: rag.chunks.map(c => ({
      content: c.content.substring(0, 300),
      score: c.score,
      topicId: c.topicId
    }))
  };
}

export async function getSessionHistory(
  supabaseUserId: string,
  subjectId: string
) {
  const session = await prisma.aiSession.findUnique({
    where: { studentId_subjectId: { studentId: supabaseUserId, subjectId } },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  return session?.messages || [];
}
