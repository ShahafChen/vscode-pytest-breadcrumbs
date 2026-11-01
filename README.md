# pytest Breadcrumbs

A tiny VS Code extension that copies the **pytest node ID** of whatever is under your cursor,
so you can paste it straight into `pytest`:

```
tests/unit/test_alerts.py::TestAlertService::test_creates_alert
```

VS Code's built-in "Copy Path" and breadcrumb bar give you `tests/unit/test_alerts.py` or a dotted
`TestAlertService > test_creates_alert`. Neither is what pytest wants. This extension joins the two
with `::` and makes the path relative to your project root.

## Install

Grab the `.vsix` from the [latest release](https://github.com/ShahafChen/vscode-pytest-breadcrumbs/releases/latest), then either:

- **Command line:** `code --install-extension pytest-breadcrumbs-<version>.vsix`
- **UI:** Extensions view → `···` menu (top right) → *Install from VSIX…*

Requires the Python extension (Pylance or Jedi) to be active, since the class/function names come
from VS Code's document symbols.

## Use

Put the cursor anywhere inside a test function, method or class in a `.py` file, then:

| How | What |
|---|---|
| Keyboard | `Cmd+Alt+C` (mac) / `Ctrl+Alt+C` (win/linux) |
| Right-click in the editor | **Copy pytest Node ID** |
| Command Palette (`Cmd+Shift+P`) | **pytest: Copy pytest Node ID** |

The node ID lands on your clipboard and the status bar shows `Copied …`. Then:

```sh
pytest tests/unit/test_alerts.py::TestAlertService::test_creates_alert
```

What you get depends on where the cursor is:

| Cursor position | Clipboard |
|---|---|
| inside a method of a class | `tests/test_x.py::TestClass::test_method` |
| inside a class but not a method | `tests/test_x.py::TestClass` (runs the whole class) |
| inside a top-level function | `tests/test_x.py::test_func` |
| anywhere else in the file | `tests/test_x.py` (runs the whole file) |

## How the project root is chosen

pytest node IDs are relative to the directory you run `pytest` from. The extension walks up from the
file's folder to the workspace folder and uses the **nearest** directory containing one of:

```
pytest.ini  pyproject.toml  tox.ini  setup.cfg  .git
```

If none is found it uses the workspace folder. This makes it work in multi-repo workspaces where each
repo has its own `pyproject.toml`. Change the list in settings:

```json
"pytestBreadcrumbs.rootMarkers": ["pytest.ini", "pyproject.toml", "tox.ini", "setup.cfg", ".git"]
```

## Rebinding the shortcut

Open *Keyboard Shortcuts* (`Cmd+K Cmd+S`) and search for `pytestBreadcrumbs.copy`, or add to `keybindings.json`:

```json
{ "key": "cmd+shift+t", "command": "pytestBreadcrumbs.copy", "when": "editorTextFocus && editorLangId == python" }
```

## Development

Plain JavaScript, no build step, no runtime dependencies.

```sh
npm test            # unit tests for the node-ID builder and root detection
npm run package     # builds pytest-breadcrumbs-<version>.vsix via @vscode/vsce
```

To hack on it, open the folder in VS Code and press `F5` to launch an Extension Development Host.

## Limitations

- Parametrized IDs (`test_x[case-1]`) are not generated. The copied ID runs every parameter set of that test, which is usually what you want; append `[...]` by hand to narrow it.
- Nested functions inside a test are included in the chain (`::test_outer::inner`) because VS Code reports them as symbols; pytest can't collect those, so copy from inside the outer `def`.

## License

MIT
