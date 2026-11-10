# Dock Window Counter

Window counts and running indicators for Omarchy's native **floating dock**—the bottom-center app strip. Indicators count windows on **the active workspace**, independently on each monitor.

![Floating dock with workspace-local indicators](preview.png)

- One local window: an outlined white dot below the app icon.
- Two or more local windows: the exact count in a dark badge at the icon’s lower-right corner.
- No local windows: no marker, and the app icon stays dimmed.
- Minimized windows count on their original workspace, using stock Omarchy or Genie origin tags.
- Omarchy agent terminal windows count with the configured terminal app; dedicated TUI app identities stay separate.
- Browser tabs are not separate windows; child dialogs and scratchpads are excluded.

The dock keeps its native pins, menus, app grid, dragging, launch and activation behavior. Icons may still be present for apps running elsewhere; only the indicator and running brightness are workspace-local.

The stable plugin ID remains `chato.floating-apps` for compatibility with existing installations.

## Requirements

Omarchy Quattro with the Quickshell shell and Hyprland Lua dispatchers. This plugin includes an MIT-licensed snapshot of Omarchy's native dock and uses its existing theme, icon, translation, animation and reduced-motion APIs. No extra runtime dependencies, network requests, background polling, or privileged operations. Python 3 is required only for the optional Genie adapter; Node.js is required only for model tests.

## Install on stock Omarchy

```sh
omarchy plugin add https://github.com/nacho1706/omarchy-dock-window-counter --enable
```

The manifest declares a clone of `omarchy.dock`, so Omarchy disables the stock dock when enabling Dock Window Counter and restores it on removal when appropriate. Your top status bar is unaffected. Dock placement, pins, and autohide continue to use Omarchy's normal dock settings.

For a local checkout, copy this folder (not a symlink) to `~/.config/omarchy/plugins/chato.floating-apps/`, then:

```sh
omarchy plugin validate ~/.config/omarchy/plugins/chato.floating-apps
omarchy-shell shell rescanPlugins
omarchy plugin enable chato.floating-apps
```

If discovery has not finished yet, retry enable once the plugin appears in `omarchy plugin list`.

## Install with Genie 0.2.4

Genie already owns an extended native dock and its animation targets. Dock Window Counter detects that enabled service and avoids creating another dock. Apply the optional adapter to Genie's **user-owned** dock copy:

```sh
python3 ~/.config/omarchy/plugins/chato.floating-apps/tools/genie-adapter.py
omarchy plugin enable chato.floating-apps
omarchy restart shell
```

The adapter validates expected source anchors and backs up changed dock files as `*.before-floating-apps-<timestamp>` before editing. Unknown source layouts are refused without changes. It is idempotent and adds self-contained indicator code; disabling/removing Dock Window Counter makes that code dormant. It never edits packaged Omarchy files. Restarting the shell applies nested dock QML/JS changes and clears any in-memory Genie animation snapshots.

The adapter preserves Genie's native activation and minimize/restore behavior. Updates to Genie may replace its dock files; rerun the adapter afterward. Other third-party dock replacements require their own integration and are not supported.

## Disable or remove

```sh
omarchy plugin disable chato.floating-apps
omarchy plugin remove chato.floating-apps
```

With Genie, the adapter remains inert and the original running-icon behavior returns. To remove the adapter source entirely, restore the changed Genie dock files from their matching `before-floating-apps` backups (Dock.qml, DockWindow.qml, and DockModel.js), then restart the shell. Restore only if there have been no intervening edits you want to retain.

## Validation

```sh
omarchy plugin validate .
python3 tools/check.py
node test/workspace.test.cjs
python3 -m unittest discover -s test -p 'test_*.py' -v
/usr/lib/qt6/bin/qmllint --max-warnings 10000 Service.qml dock/Dock.qml dock/DockWindow.qml dock/AppGrid.qml
python3 -m py_compile tools/genie-adapter.py
```

The Qt 6 linter checks syntax but emits unresolved `qs.*` host-import and inherited native-code warnings outside the running shell; live loading is checked separately. The Qt 5 `qmllint` on PATH cannot parse the upstream native Dock.qml.

Model tests cover workspace isolation, duplicate counts, stock and Genie minimized origins, stale tags, desktop entry aliases, moves, and closures. The added indicator uses plain text and localized numbers; all copied dock text sinks use plain text. See `VERIFICATION.md` for the live checks and remaining coverage.

## Marketplace

One plugin, root manifest, README, preview, MIT license, third-party attribution and documented safe removal are included. See `MARKETPLACE.md` for publishing metadata and remaining steps. The public repository and tagged release are hosted at [nacho1706/omarchy-dock-window-counter](https://github.com/nacho1706/omarchy-dock-window-counter). Marketplace listing requires a separate submission and maintainer approval.
