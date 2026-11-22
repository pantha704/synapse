# Report vs. code — what changed and why

Compiled: `Synapse_Proposal_corrected.pdf` — 28 pages, A4, builds with
`tectonic main.tex` + `biber` (no Overleaf needed).

Every edit below makes a claim true of the repository at `pantha704/synapse`
(commit `5bbb8d6`), or removes a claim nothing in the code supports. No number,
citation key, `\label` or `\ref` was touched.

## False claims removed or corrected

| Claim in the submitted report | Where it was | What the code actually does | Edit |
| --- | --- | --- | --- |
| "NVIDIA NIM" as a separate compute layer, plus a "Rerank" node in the architecture figure | ch5 §System Architecture, architecture TikZ, tech table | One Groq SDK. No NIM endpoint, no reranker, no second inference path. | Figure now shows a single `Groq Inference` node; table row reads "Groq (open-weight chat models)". |
| "Next.js 15" | Abstract, ch5 stack list, ch5 tech table | `next@16.2.2`, React 19.2.4, Prisma 7 | Now "Next.js 16". |
| "heatmap overlay on the class mindmap" / "visual heatmap of class progress" | ch1, ch3, ch5, ch6, ch7, ch8 | Teacher analytics aggregates engagement into three bands (Progressing / Stuck / Inactive) and flags un-started topics. There is no per-student overlay on the canvas. | Replaced with "class progress view", "engagement bands", and a list of topics the class has not started. |
| Four states "locked → upcoming → in-progress → completed" | Abstract, ch3, ch5, ch6, ch7 | Three are stored (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`); "upcoming" is *derived* — teacher has opened the topic, student has not started. "Locked" was never a state, only a visual consequence of the teacher not opening the topic. | Rewritten as not started / upcoming / in progress / completed, with the derivation stated. |
| "Row-Level Security" described loosely as database isolation | ch1, ch5, ch6, ch7 | Now genuinely implemented: a policy on every table keyed to the caller's institution, plus one `SECURITY DEFINER` function for joining a batch by code. Verified by a cross-tenant probe (one institution's teacher sees 0 rows of the other's data). | Kept, and made precise — including the sanctioned join-code exception. |

## Claims that were false and are now true (built during this pass)

| Claim | Built as |
| --- | --- |
| Super Admin creates institutions; admins add users by CSV | `User.isSuperAdmin`, `/admin/institutions`, `/teacher/students` CSV import |
| XP points and engagement badges | Derived from completed topics: 10 XP each, level per 100 XP, badges at 1/5/10/25 |
| pgvector document embeddings | Vector path retained but opt-in; retrieval falls back to PostgreSQL full-text search because both providers retired their embedding models (Groq 2026-08-25, NVIDIA NIM 403 on this account) |

## Front matter

- `Pratham Jaishwal` → `Pratham Jaiswal` (the email was already correct).
- Supervisor fields remain commented out in `bibtext/title_page.tex` — fill those in before submission; they are the one line an examiner checks first.

## Integrity gate

`tex-integrity-check.py` run per chapter:

```
Abstract.tex                             PASS
chapter1-Introduction.tex                PASS
chapter3-Significance.tex                PASS
chapter5-Proposed Method.tex             FAIL — documented exception, see below
chapter6-Research Gap Identification.tex PASS
chapter7-Objectives.tex                  PASS
chapter8-Workplan.tex                    PASS
bibtext/title_page.tex                   PASS
```

chapter 5 exception: the checker reports `missing '7'`, `missing '12'`, `added '16'`.
A token-level diff of every numeric token in the file shows exactly one change, `15 → 16`.
The other two are TikZ y-coordinates (`-7`, `-12`) that belonged to the deleted NIM and
Rerank nodes. No number in prose moved.

## Build notes

- `\usepackage[inline]{asymptote}` is commented out: no `asy` figures exist and the
  package is not in a tectonic bundle.
- `main page.tex` renamed `main.tex`; biber cannot resolve a `main page.bcf` containing a space.
- Body font cannot render U+2014 — em dashes are written `---`.

## Correction pass — 22 Nov 2026

The report described the system as it was designed, in six places where the code had since
diverged. Each was rewritten to what the deployment actually does; the compiled PDF is
`Synapse_Proposal_corrected.pdf` (28 pages, same as before).

| Claim in the document | What the code does | Fixed in |
| --- | --- | --- |
| "A teacher creates a course, builds the syllabus" | The topic tree is seeded; the teacher arranges it on the canvas | ch5 §Proposed Method |
| Four node states with *Upcoming* | Three states on the map; *upcoming* is derived on the path cards | ch5, ch6 |
| "an Admin adds teachers and students through CSV uploads" | A teacher invites students by CSV or join code | ch5 |
| Progress "inferred from login frequency and time spent" | Bands are computed from recorded events; the app writes topic completions | ch5 |
| "the response is streamed back" | `stream: false` — one reply | ch5 |
| "State management is handled by Zustand" | Client state is React state; nothing imports Zustand | ch5 (prose, table, figure) |

Also corrected: the RLS sentence now says policies cover the browser path and the
application role scopes tenants in code (the previous wording implied the ORM connection
was policy-bound).

Integrity: `tex-integrity-check.py` reports identical citations, labels, refs, numbers and
quoted spans for both edited chapters.
