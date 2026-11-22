const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Parses `name,email` or `email` per line; blank lines and a header row are ignored. */
export function parseStudentCsv(csv: string) {
  const rows: { name: string; email: string }[] = [];
  const skipped: string[] = [];

  for (const raw of csv.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const cells = line.split(",").map((c) => c.trim());
    const emailCell = cells.find((c) => EMAIL_RE.test(c));
    if (!emailCell) {
      if (!/^(name|email|student)/i.test(line)) skipped.push(line);
      continue;
    }
    const nameCell = cells.find((c) => c !== emailCell && c.length > 0) ?? emailCell.split("@")[0];
    rows.push({ name: nameCell, email: emailCell.toLowerCase() });
  }
  return { rows, skipped };
}
