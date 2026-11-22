import { createEmbedding } from "../src/lib/ai/embeddings";
async function main() {
  const r = await createEmbedding("Data structures and algorithms test sentence.");
  console.log("dims", r.embedding.length, "model", r.model);
}
main().catch((e) => { console.error("ERR", e.message); process.exit(1); });
