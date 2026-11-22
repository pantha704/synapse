import { describe, expect, it } from "vitest";
import { chunkText } from "@/lib/ai/ingestion";

describe("chunkText", () => {
  it("terminates when the document does not end on a sentence boundary", () => {
    // regression: the old loop computed start = chunkEnd - overlap on the final
    // chunk, which never advanced past EOF and produced 10k chunks until OOM
    const text = "a".repeat(5000);
    const chunks = chunkText(text);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.length).toBeLessThan(100);
  });

  it("always moves forward, so no chunk repeats the previous one", () => {
    const text = Array.from({ length: 200 }, (_, i) => `Sentence number ${i} about trees.`).join(" ");
    const chunks = chunkText(text);
    expect(new Set(chunks).size).toBe(chunks.length);
  });

  it("covers the whole document", () => {
    const text = Array.from({ length: 60 }, (_, i) => `Point ${i}.`).join(" ");
    const chunks = chunkText(text);
    const covered = chunks.join(" ").replace(/\s+/g, "");
    expect(covered.length).toBeGreaterThanOrEqual(text.replace(/\s+/g, "").length * 0.9);
  });

  it("drops fragments shorter than ten characters", () => {
    const chunks = chunkText("Short. ".repeat(3) + "x".repeat(20) + " tail");
    expect(chunks.every((c) => c.length > 10)).toBe(true);
  });

  it("handles an empty document", () => {
    expect(chunkText("")).toEqual([]);
  });
});
