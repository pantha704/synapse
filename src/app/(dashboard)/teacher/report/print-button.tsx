"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold text-white print:hidden"
    >
      Print / Save as PDF
    </button>
  );
}
