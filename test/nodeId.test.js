'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { findRoot, nodeId } = require('../nodeId');

const sym = (name, kind, startLine, endLine, children = []) =>
  ({ name, kind, range: { start: { line: startLine }, end: { line: endLine } }, children });

// class TestFoo:            (0)
//     x = 1                 (1)
//     def test_a(self): ... (2-3)
//     def test_b(self): ... (4-5)
// def test_top(): ...       (7-8)
const symbols = [
  sym('TestFoo', 4, 0, 5, [
    sym('x', 13, 1, 1),
    sym('test_a', 5, 2, 3),
    sym('test_b', 5, 4, 5),
  ]),
  sym('test_top', 11, 7, 8),
];

test('method inside class', () => {
  assert.equal(nodeId('tests/test_foo.py', symbols, 3), 'tests/test_foo.py::TestFoo::test_a');
});
test('class body outside any method', () => {
  assert.equal(nodeId('tests/test_foo.py', symbols, 1), 'tests/test_foo.py::TestFoo');
});
test('top-level function', () => {
  assert.equal(nodeId('tests/test_foo.py', symbols, 8), 'tests/test_foo.py::test_top');
});
test('outside any symbol gives the file only', () => {
  assert.equal(nodeId('tests/test_foo.py', symbols, 6), 'tests/test_foo.py');
});
test('backslash paths are normalised', () => {
  const path = require('path');
  assert.equal(nodeId(['tests', 'test_foo.py'].join(path.sep), [], 0), 'tests/test_foo.py');
});

test('findRoot picks the nearest marker, stopping at the workspace folder', () => {
  const existing = new Set(['/ws/repo/pyproject.toml', '/ws/.git']);
  const exists = (p) => existing.has(p);
  const markers = ['pyproject.toml', '.git'];
  assert.equal(findRoot('/ws/repo/tests/unit', '/ws', markers, exists), '/ws/repo');
  assert.equal(findRoot('/ws/other/tests', '/ws', markers, exists), '/ws');
  assert.equal(findRoot('/elsewhere/a/b', '/elsewhere', markers, exists), '/elsewhere');
});
