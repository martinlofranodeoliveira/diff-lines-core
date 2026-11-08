# Contract — diff-lines-core

Pure ESM in `src/diff.mjs`, zero runtime dependencies, Node >= 22.
Lines split on LF (CRLF normalized); trailing newline is not a line.

| Export | Result |
| --- | --- |
| `MAX_LINES` (2000) · `MAX_CELLS` (4M DP cells) | Hard bounds. |
| `diffLines(a, b)` | `[{op:'same'\|'del'\|'ins', line}]`. Deterministic (del before ins). Replaying non-`del` ops yields `b`. |
| `stats(ops)` | `{ same, del, ins }` counts. |
| `unified(ops, context=3)` | Hunks with `@@ -a,len +b,len @@` headers; `''` when identical. |

Errors: `NOT_STRING` · `TOO_MANY_LINES` · `TOO_BIG` · `BAD_CONTEXT`.
