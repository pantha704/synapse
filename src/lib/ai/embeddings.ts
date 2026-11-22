import Groq from "groq-sdk";

// Groq retired its embedding models (nv-embedqa-e5-v5 ended 2026-08-25) and the
// NIM keys on this account are not provisioned for embeddings. The vector path is
// therefore opt-in: set EMBEDDING_BASE_URL + EMBEDDING_MODEL + EMBEDDING_API_KEY.
// Without them, RAG falls back to Postgres full-text search (see search.ts).
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL ?? "";

export function isEmbeddingsConfigured(): boolean {
  return Boolean(EMBEDDING_MODEL && process.env.EMBEDDING_API_KEY && process.env.EMBEDDING_BASE_URL);
}

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  usage: { prompt_tokens: number };
}

export async function createEmbedding(text: string): Promise<EmbeddingResult> {
  if (!isEmbeddingsConfigured()) throw new Error("EMBEDDINGS_UNAVAILABLE");

  const response = await fetch(`${process.env.EMBEDDING_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.EMBEDDING_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text, encoding_format: "float" }),
    // a provider that never answers used to hold the whole ingestion request open
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`embedding provider ${response.status}: ${(await response.text()).slice(0, 120)}`);
  }

  const data = (await response.json()) as {
    data: { embedding: number[] }[];
    model: string;
    usage?: { prompt_tokens: number };
  };

  // the column is vector(1024); a provider returning another width fails later
  // with a raw Postgres error after the upload already looked successful
  const embedding = data.data[0]?.embedding ?? [];
  if (embedding.length !== 1024) {
    throw new Error(`EMBEDDING_DIM_MISMATCH: expected 1024, got ${embedding.length}`);
  }

  return {
    embedding,
    model: data.model,
    usage: { prompt_tokens: data.usage?.prompt_tokens ?? 0 },
  };
}

export async function createEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  const results: EmbeddingResult[] = [];
  for (let i = 0; i < texts.length; i += 10) {
    const batch = texts.slice(i, i + 10);
    results.push(...(await Promise.all(batch.map(createEmbedding))));
  }
  return results;
}

/** Chat is a separate concern; Groq still serves these. */
export const CHAT_MODEL = process.env.CHAT_MODEL ?? "openai/gpt-oss-120b";
export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" });
