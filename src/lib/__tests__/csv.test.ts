import { describe, expect, it } from "vitest";
import { parseStudentCsv } from "@/lib/csv";

describe("parseStudentCsv", () => {
  it("reads name,email pairs", () => {
    const { rows } = parseStudentCsv("Aditi Sharma,aditi@example.edu");
    expect(rows).toEqual([{ name: "Aditi Sharma", email: "aditi@example.edu" }]);
  });

  it("accepts a bare email and derives the name", () => {
    const { rows } = parseStudentCsv("rahul@example.edu");
    expect(rows[0]).toEqual({ name: "rahul", email: "rahul@example.edu" });
  });

  it("skips the header row without reporting it as junk", () => {
    const { rows, skipped } = parseStudentCsv("name,email\nNeha,neha@example.edu");
    expect(rows).toHaveLength(1);
    expect(skipped).toEqual([]);
  });

  it("reports lines it cannot use", () => {
    const { rows, skipped } = parseStudentCsv("Neha,neha@example.edu\nnot a person\n,,,");
    expect(rows).toHaveLength(1);
    expect(skipped).toEqual(["not a person", ",,,"]);
  });

  it("lowercases emails and tolerates CRLF plus blank lines", () => {
    const { rows } = parseStudentCsv("\r\nVikram,Vikram@Example.EDU\r\n\r\n");
    expect(rows).toEqual([{ name: "Vikram", email: "vikram@example.edu" }]);
  });
});
