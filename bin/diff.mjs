#!/usr/bin/env node
// Demo: fixed diff, asserts exact hunk. --assert exits non-zero on mismatch.
import { diffLines, unified, stats } from '../src/diff.mjs';

const A = 'l1\nl2\nl3\nl4\n';
const B = 'l1\nL2\nl3\nl4 extra\n';

let failed = 0;
const ops = diffLines(A, B);
const s = stats(ops);
const pass1 = s.same === 2 && s.del === 2 && s.ins === 2;
console.log(`${pass1 ? 'PASS' : 'FAIL'} stats ${JSON.stringify(s)}`);
if (!pass1) failed++;
const u = unified(ops, 1);
const pass2 = u.includes('-l2\n+L2\n') && u.includes('-l4\n+l4 extra\n');
console.log(`${pass2 ? 'PASS' : 'FAIL'} hunk present`);
if (!pass2) failed++;
if (process.argv.includes('--assert') && failed > 0) process.exit(1);
if (failed > 0) process.exitCode = 1;
console.log(failed === 0 ? 'demo: all cases as expected' : `demo: ${failed} mismatch(es)`);
