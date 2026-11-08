// SPDX-License-Identifier: MIT
// Line diff via LCS dynamic programming: op list plus unified hunks with
// context. Bounded input, deterministic output. No network, no I/O.

export const MAX_LINES = 2000;
export const MAX_CELLS = 4000000;

export class DiffError extends Error {
  constructor(code, detail = '') {
    super(detail ? `${code}: ${detail}` : code);
    this.name = 'DiffError';
    this.code = code;
  }
}

function splitLines(text, name) {
  if (typeof text !== 'string') throw new DiffError('NOT_STRING', name);
  if (text === '') return [];
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  if (text.endsWith('\n')) lines.pop();
  if (lines.length > MAX_LINES) throw new DiffError('TOO_MANY_LINES', name);
  return lines;
}

/**
 * LCS table lengths only (two rows), then backtrack with the full table
 * only when needed. Here: full table capped by MAX_CELLS.
 */
export function diffLines(a, b) {
  const x = splitLines(a, 'a');
  const y = splitLines(b, 'b');
  const m = x.length;
  const n = y.length;
  if (m * n > MAX_CELLS) throw new DiffError('TOO_BIG');
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (x[i] === y[j]) { ops.push({ op: 'same', line: x[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { ops.push({ op: 'del', line: x[i] }); i++; }
    else { ops.push({ op: 'ins', line: y[j] }); j++; }
  }
  while (i < m) { ops.push({ op: 'del', line: x[i] }); i++; }
  while (j < n) { ops.push({ op: 'ins', line: y[j] }); j++; }
  return ops;
}

/** Stats: { same, del, ins }. */
export function stats(ops) {
  const s = { same: 0, del: 0, ins: 0 };
  for (const o of ops) s[o.op]++;
  return s;
}

/**
 * Unified hunks with `context` same-lines around changes.
 * Headers '@@ -aStart,aLen +bStart,bLen @@' (1-based).
 */
export function unified(ops, context = 3) {
  if (!Number.isInteger(context) || context < 0) throw new DiffError('BAD_CONTEXT');
  // Mark changed ops plus context window; group contiguous taken ranges.
  const take = new Array(ops.length).fill(false);
  ops.forEach((o, idx) => {
    if (o.op === 'same') return;
    for (let k = Math.max(0, idx - context); k <= Math.min(ops.length - 1, idx + context); k++) take[k] = true;
  });
  // Line numbers per op (null when the side has no line there).
  const lineA = [];
  const lineB = [];
  {
    let la = 1;
    let lb = 1;
    for (const o of ops) {
      lineA.push(o.op === 'ins' ? null : la);
      lineB.push(o.op === 'del' ? null : lb);
      if (o.op !== 'ins') la++;
      if (o.op !== 'del') lb++;
    }
  }
  const out = [];
  let k = 0;
  while (k < ops.length) {
    if (!take[k]) { k++; continue; }
    let end = k;
    while (end + 1 < ops.length && take[end + 1]) end++;
    const slice = ops.slice(k, end + 1);
    const aNums = slice.map((_, t) => lineA[k + t]).filter((v) => v !== null);
    const bNums = slice.map((_, t) => lineB[k + t]).filter((v) => v !== null);
    out.push(`@@ -${aNums.length ? aNums[0] : 1},${aNums.length} +${bNums.length ? bNums[0] : 1},${bNums.length} @@`);
    for (const o of slice) out.push(`${o.op === 'same' ? ' ' : o.op === 'del' ? '-' : '+'}${o.line}`);
    k = end + 1;
  }
  return out.join('\n') + (out.length ? '\n' : '');
}
