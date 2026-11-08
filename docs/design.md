# Design — diff-lines-core

Suffix LCS table (match preferred on ties, deletions before insertions)
gives a deterministic op list; replaying it must reproduce `b` — the
test pins that invariant on five shapes including empties. Hunks are a
second pass: mark changes, widen by context, slice contiguous runs,
number from the same walk.

Oracle: exact op list, replay identity, hunk header/contents, empty
diff. Myers and patience variants out of scope by design.
