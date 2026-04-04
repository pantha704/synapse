import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || "",
});

// NVIDIA NV-EmbedQA-E5-v5 via Groq — 1024-dim embeddings
const EMBEDDING_MODEL = "nvidia/nv-embedqa-e5-v5";

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage: { prompt_tokens: number };
}

export async function createEmbedding(text: string): Promise<EmbeddingResult> {
  if (!process.env.GROQ_API_KEY && !process.env.NEXT_PUBLIC_GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const response = await groq.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    encoding_format: "float",
    dimensions: 1024,
  });

  const data = response.data[0];
  return {
    embedding: data.embedding as number[],
    model: response.model,
    usage: { prompt_tokens: response.usage?.prompt_tokens || 0 },
  };
}

export async function createEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  // Process in batches of 10 to avoid rate limits
  const results: EmbeddingResult[] = [];
  for (let i = 0; i < texts.length; i += 10) {
    const batch = texts.slice(i, i + 10);
    const batchResults = await Promise.all(batch.map(createEmbedding));
    results.push(...batchResults);
  }
  return results;
}
