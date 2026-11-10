#!/usr/bin/env python3
"""Add self-contained workspace indicators to the user-owned Genie dock.
Validates all edits before writing, backs up changed files, and is idempotent.
"""
import argparse
import os
from pathlib import Path
import shutil
import time

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--plugin-dir', type=Path, default=Path(os.environ.get('XDG_CONFIG_HOME', Path.home() / '.config')) / 'omarchy/plugins/chato.genie')
args = parser.parse_args()
source = Path(__file__).resolve().parent
model = args.plugin_dir / 'dock/DockModel.js'
window = args.plugin_dir / 'dock/DockWindow.qml'
dock = args.plugin_dir / 'dock/Dock.qml'
original = {p: p.read_text() for p in (model, window, dock)}
updated = dict(original)
indicator = (source / 'indicator.qml').read_text()
if 'Floating Apps indicators' in original[window]:
    start = original[window].index('    // Floating Apps indicators')
    end = original[window].index('    // With animations off', start)
    updated[window] = original[window][:start] + indicator + original[window][end:]
else:
    checks = ['  property var dock: null', '    property real pulse: 1', '(appSlot.windowCount > 0 ? 1 : window.idleOpacity)', '    // With animations off it holds still rather than spinning through']
    for anchor in checks:
        if original[window].count(anchor) != 1:
            raise SystemExit('Unsupported Genie dock source; no files changed: ' + anchor)
    enabled = '''
  readonly property bool workspaceIndicators: {
    var config = dock && dock.genie ? dock.genie.userConfig : ({})
    return (config.plugins || []).some(function(p) { return p.id === "chato.floating-apps" })
      && (config.disabledPlugins || []).indexOf("chato.floating-apps") < 0
  }
'''
    s = original[window].replace(checks[0], checks[0] + enabled)
    s = s.replace(checks[1], '    readonly property int localWindowCount: window.dock ? DockModel.workspaceCount(Hyprland.toplevels.values, key, window.workspaceId, window.dock.entryForAppId) : 0\n' + checks[1])
    s = s.replace(checks[2], '((window.workspaceIndicators ? appSlot.localWindowCount : appSlot.windowCount) > 0 ? 1 : window.idleOpacity)')
    updated[window] = s.replace(checks[3], indicator + checks[3])
helper = (source / 'workspace-helper.js').read_text()
marker = '// Floating Apps: one monitor'
base = original[model].split(marker)[0].rstrip()
updated[model] = base + '\n\n' + helper
if 'Floating Apps terminal identity' not in original[dock]:
    anchor = '  function entryForAppId(appId) {'
    if original[dock].count(anchor) != 1:
        raise SystemExit('Unsupported Genie app resolver; no files changed')
    enabled = '''  readonly property bool floatingAppsEnabled: {
    var config = root.genie ? root.genie.userConfig : ({})
    return (config.plugins || []).some(function(p) { return p.id === "chato.floating-apps" })
      && (config.disabledPlugins || []).indexOf("chato.floating-apps") < 0
  }
'''
    resolver = (source / 'terminal-resolver.qml').read_text()
    updated[dock] = original[dock].replace(anchor, enabled + resolver + anchor + '\n    if (root.floatingAppsEnabled) appId = DockModel.canonicalAppId(appId, root.floatingAppsTerminalId)')
changed = [p for p in original if updated[p] != original[p]]
stamp = str(time.time_ns())
for path in changed:
    shutil.copy2(path, path.with_name(path.name + '.before-floating-apps-' + stamp))
for path in changed:
    path.write_text(updated[path])
print('Genie adapter updated' if changed else 'Genie adapter already installed')
