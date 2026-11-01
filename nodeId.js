'use strict';
const path = require('path');

// vscode.SymbolKind values that pytest can collect: Class=4, Method=5, Constructor=8, Function=11
const COLLECTABLE = new Set([4, 5, 8, 11]);

/** Nearest dir from `fileDir` up to (and including) `stopDir` that contains a marker; else `stopDir`. */
function findRoot(fileDir, stopDir, markers, exists) {
  let dir = fileDir;
  for (;;) {
    if (markers.some((m) => exists(path.join(dir, m)))) return dir;
    if (dir === stopDir || path.dirname(dir) === dir) return stopDir;
    dir = path.dirname(dir);
  }
}

/** Names of the nested class/function symbols whose range contains `line`, outermost first. */
function symbolChain(symbols, line) {
  for (const s of symbols) {
    const r = s.range;
    if (COLLECTABLE.has(s.kind) && r.start.line <= line && line <= r.end.line) {
      return [s.name, ...symbolChain(s.children || [], line)];
    }
  }
  return [];
}

/** `tests/test_x.py::TestClass::test_func` — path is always forward-slashed, as pytest accepts on every OS. */
function nodeId(relPath, symbols, line) {
  const file = relPath.split(path.sep).join('/');
  return [file, ...symbolChain(symbols, line)].join('::');
}

module.exports = { findRoot, symbolChain, nodeId };
