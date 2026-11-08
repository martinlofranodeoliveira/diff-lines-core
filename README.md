# diff-lines-core

Line diff via LCS: op list, stats and unified hunks with context. Zero
runtime dependencies, Node >= 22.

Part of the LOFRANO TECNOLOGIA open-source lab. MIT.

```js
import { diffLines, unified } from './src/diff.mjs';
unified(diffLines('a\nb\n', 'a\nB\n'), 1);
```

```sh
npm test          # 6 tests, node:test, no dependencies
npm run demo
```

At most 2000 lines per side. MIT — see `LICENSE`.
[Versão em português](README.pt-BR.md).
