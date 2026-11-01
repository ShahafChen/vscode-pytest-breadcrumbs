'use strict';
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { findRoot, nodeId } = require('./nodeId');

async function copy() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== 'python' || editor.document.isUntitled) {
    vscode.window.showWarningMessage('pytest Breadcrumbs: open a saved Python file first.');
    return;
  }
  const doc = editor.document;
  const file = doc.uri.fsPath;
  const folder = vscode.workspace.getWorkspaceFolder(doc.uri);
  const stopDir = folder ? folder.uri.fsPath : path.dirname(file);
  const markers = vscode.workspace.getConfiguration('pytestBreadcrumbs').get('rootMarkers', []);
  const root = findRoot(path.dirname(file), stopDir, markers, fs.existsSync);

  const symbols = (await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', doc.uri)) || [];
  const id = nodeId(path.relative(root, file), symbols, editor.selection.active.line);

  await vscode.env.clipboard.writeText(id);
  if (symbols.length === 0) {
    vscode.window.showWarningMessage(`pytest Breadcrumbs: no symbols from the Python language server yet, copied "${id}".`);
  } else {
    vscode.window.setStatusBarMessage(`Copied ${id}`, 4000);
  }
}

exports.activate = (context) => {
  context.subscriptions.push(vscode.commands.registerCommand('pytestBreadcrumbs.copy', copy));
};
exports.deactivate = () => {};
