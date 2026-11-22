import { readFileSync } from "node:fs";
import { PDFParse } from "pdf-parse";
async function main() {
  const buf = readFileSync("/home/ubuntu/wa-read/pulled/synapse-proposal/main-page_2026-05-05.pdf");
  const p = new PDFParse({ data: buf });
  const r = await p.getText();
  console.log("chars", r.text.length, "pages", r.total);
  await p.destroy();
  console.log("destroyed ok");
}
main();
