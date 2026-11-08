import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { diffLines, stats, unified, DiffError } from '../src/diff.mjs';

describe('diffLines', () => {
  it('finds a changed middle line', () => {
    const ops = diffLines('a\nb\nc\n', 'a\nB\nc\n');
    assert.deepEqual(ops, [
      { op: 'same', line: 'a' },
      { op: 'del', line: 'b' },
      { op: 'ins', line: 'B' },
      { op: 'same', line: 'c' },
    ]);
    assert.deepEqual(stats(ops), { same: 2, del: 1, ins: 1 });
  });
  it('handles empty and identical inputs', () => {
    assert.deepEqual(diffLines('', ''), []);
    assert.deepEqual(diffLines('x\n', 'x\n').map((o) => o.op), ['same']);
    assert.deepEqual(stats([]), { same: 0, del: 0, ins: 0 });
  });
  it('replays: apply ops to a yields b', () => {
    const pairs = [['a\nb\n', 'a\nc\n'], ['', 'x\ny\n'], ['x\ny\n', ''], ['same\n', 'same\n']];
    for (const [a, b] of pairs) {
      const out = [];
      for (const o of diffLines(a, b)) if (o.op !== 'del') out.push(o.line);
      assert.equal(out.join('\n') + (out.length ? '\n' : ''), b);
    }
  });
  it('rejects oversize and non-strings', () => {
    assert.throws(() => diffLines(42, ''), (e) => e.code === 'NOT_STRING');
    assert.throws(() => diffLines('x\n'.repeat(2001), ''), (e) => e.code === 'TOO_MANY_LINES');
    assert.throws(() => unified([], -1), (e) => e.code === 'BAD_CONTEXT');
    assert.ok(new DiffError('X') instanceof Error);
  });
});

describe('unified', () => {
  it('renders one hunk with context and header', () => {
    const ops = diffLines('l1\nl2\nl3\nl4\nl5\nl6\nl7\n', 'l1\nl2\nL3\nl4\nl5\nl6\nl7\n');
    const u = unified(ops, 1);
    assert.ok(u.startsWith('@@ -2,3 +2,3 @@\n'));
    assert.ok(u.includes('-l3\n+L3\n'));
  });
  it('returns empty for identical inputs', () => {
    assert.equal(unified(diffLines('a\n', 'a\n')), '');
  });
});
