"""Exercise safe source patching independently of an installed Genie plugin."""
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent


class AdapterTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.plugin = Path(self.temp.name) / 'genie'
        dock = self.plugin / 'dock'
        dock.mkdir(parents=True)
        self.paths = [dock / name for name in ['Dock.qml', 'DockModel.js', 'DockWindow.qml']]
        self.paths[0].write_text('Item {\n  function entryForAppId(appId) {\n    return null\n  }\n}\n')
        self.paths[1].write_text('function nativeDockHelper() { return true }\n')
        self.paths[2].write_text('''PanelWindow {
  property var dock: null
  component AppSlot: Item {
    property real pulse: 1
    Image { opacity: (appSlot.windowCount > 0 ? 1 : window.idleOpacity) }
    // With animations off it holds still rather than spinning through
  }
}
''')

    def run_adapter(self):
        return subprocess.run([sys.executable, str(ROOT / 'tools/genie-adapter.py'), '--plugin-dir', str(self.plugin)], text=True, capture_output=True)

    def test_installs_with_original_backups_and_is_idempotent(self):
        before = {p: p.read_bytes() for p in self.paths}
        result = self.run_adapter()
        self.assertEqual(result.returncode, 0, result.stderr)
        for path in self.paths:
            backups = list(path.parent.glob(path.name + '.before-floating-apps-*'))
            self.assertEqual(len(backups), 1)
            self.assertEqual(backups[0].read_bytes(), before[path])
        installed = {p: p.read_bytes() for p in self.paths}
        self.assertIn(b'workspaceCount', installed[self.paths[1]])
        self.assertIn(b'canonicalAppId', installed[self.paths[0]])
        self.assertIn(b'workspaceIndicators', installed[self.paths[2]])
        self.assertEqual(self.run_adapter().returncode, 0)
        self.assertEqual(installed, {p: p.read_bytes() for p in self.paths})
        self.assertEqual(len(list(self.paths[0].parent.glob('*.before-floating-apps-*'))), 3)

    def test_unknown_source_is_refused_without_partial_changes(self):
        self.paths[0].write_text('unsupported Genie resolver')
        before = {p: p.read_bytes() for p in self.paths}
        self.assertNotEqual(self.run_adapter().returncode, 0)
        self.assertEqual(before, {p: p.read_bytes() for p in self.paths})
        self.assertEqual(list(self.paths[0].parent.glob('*.before-floating-apps-*')), [])

    def test_updates_an_existing_indicator_without_duplicating_helpers(self):
        self.assertEqual(self.run_adapter().returncode, 0)
        self.paths[2].write_text(self.paths[2].read_text().replace('#eb202020', '#000000'))
        self.assertEqual(self.run_adapter().returncode, 0)
        self.assertIn('#eb202020', self.paths[2].read_text())
        self.assertEqual(self.paths[1].read_text().count('function workspaceCount('), 1)


if __name__ == '__main__':
    unittest.main()
