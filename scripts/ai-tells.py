#!/usr/bin/env python3
"""Scan LaTeX prose for the patterns Wikipedia:Signs of AI writing documents.

Usage: ai-tells.py FILE.tex [FILE.tex ...]
Prints one line per hit with the file and line number, then a tally.
"""
import re
import sys
from collections import Counter

# Wikipedia:Signs of AI writing § "High density of AI vocabulary words",
# merged across the 2023-2026 model generations, plus the puffery vocabulary
# from § "Undue emphasis on significance" and § "Superficial analyses".
VOCAB = [
    "additionally", "align with", "boasts", "bolstered", "crucial", "deep dive",
    "delve", "emphasizing", "enhance", "enduring", "fostering", "garner",
    "highlighting", "intricate", "interplay", "landscape", "meticulous",
    "multifaceted", "pivotal", "realm", "robust", "seamless", "showcasing",
    "tapestry", "testament", "underscore", "vibrant", "leverage", "harness",
    "holistic", "paradigm", "synergy", "cutting-edge", "groundbreaking",
    "game-changer", "ever-evolving", "at the forefront", "pave the way",
    "shed light", "it is worth noting", "it's worth noting", "it is important to note",
    "moreover", "furthermore", "in conclusion", "ultimately", "notably",
    "plays a pivotal role", "plays a key role", "plays a crucial role",
    "reflects the broader", "underscores the importance", "highlights the importance",
    "in today's", "serves as", "stands as", "represents a", "functions as",
    "constitutes a", "acts as",
]

# § "Negative parallelisms": not just X but Y / not X, but Y / Y rather than X
NEG_PARALLEL = [
    r"\bnot just\b", r"\bnot only\b", r"\bisn't just\b", r"\bis not just\b",
    r"\bnot merely\b", r"\brather than\b",
]

# § "Superficial analyses": a present participle bolted on to explain significance
PARTICIPLE_TAIL = re.compile(
    r",\s+(highlighting|emphasizing|showcasing|underscoring|fostering|demonstrating|"
    r"reflecting|enabling|ensuring|allowing|creating|providing|making|reinforcing|"
    r"representing|signaling|signalling|illustrating|capturing|driving|shaping)\b",
    re.IGNORECASE,
)

# § "Outline-like conclusions about challenges and future prospects"
OUTLINE = [
    "despite these challenges", "despite the challenges", "future prospects",
    "moving forward", "going forward", "challenges and opportunities",
    "continues to evolve", "in an ever-changing",
]

# § "Rule of three": three coordinated items
TRIAD = re.compile(r"\b\w+,\s+\w+,?\s+and\s+\w+\b")


def strip_tex(line: str) -> str:
    line = re.sub(r"%.*$", "", line)
    line = re.sub(r"\\(cite|ref|label|begin|end|thead|resizebox|textcolor|textbf|emph|texttt)\{[^}]*\}", " ", line)
    line = re.sub(r"\\[a-zA-Z]+\*?", " ", line)
    line = line.replace("{", " ").replace("}", " ")
    return line


def main(paths):
    tally = Counter()
    total = 0
    for path in paths:
        with open(path, encoding="utf-8") as fh:
            for n, raw in enumerate(fh, 1):
                line = strip_tex(raw)
                low = line.lower()
                if len(line.split()) < 2:
                    continue
                hits = []
                for w in VOCAB:
                    if w in low:
                        hits.append(f"vocab:{w}")
                for pat in NEG_PARALLEL:
                    if re.search(pat, low):
                        hits.append(f"parallel:{pat.strip(chr(92)+'b')}")
                for m in PARTICIPLE_TAIL.finditer(line):
                    hits.append(f"participle:{m.group(1).lower()}")
                for w in OUTLINE:
                    if w in low:
                        hits.append(f"outline:{w}")
                for m in TRIAD.finditer(line):
                    hits.append("triad")
                if hits:
                    total += len(hits)
                    tally.update(h.split(":")[0] for h in hits)
                    print(f"{path}:{n}: {', '.join(sorted(set(hits)))}")
    print(f"\n{total} hits", dict(tally))


if __name__ == "__main__":
    main(sys.argv[1:])
