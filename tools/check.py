#!/usr/bin/env python3
"""Offline release checks for the Omarchy plugin repository."""
import json
from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / 'manifest.json').read_text())
assert type(manifest.get('schemaVersion')) is int and manifest['schemaVersion'] == 1
limits = {'id': 128, 'name': 120, 'version': 64, 'author': 120, 'description': 500, 'license': 120}
for field, limit in limits.items():
    value = manifest.get(field)
    assert isinstance(value, str) and value == value.strip() and 0 < len(value) <= limit, field
    assert not any(ord(c) < 32 or ord(c) == 127 for c in value), field
assert re.fullmatch(r'[a-z0-9][a-z0-9._-]*', manifest['id'])
assert '..' not in manifest['id'] and not manifest['id'].startswith('omarchy.')
entries = {'bar': 'bar', 'bar-widget': 'barWidget', 'menu': 'menu', 'overlay': 'overlay', 'panel': 'panel', 'service': 'service'}
assert manifest['kinds'] and all(kind in entries for kind in manifest['kinds'])
assert all(entries[kind] in manifest['entryPoints'] for kind in manifest['kinds'])
for entry in manifest['entryPoints'].values():
    assert isinstance(entry, str) and entry and not entry.startswith('/')
    assert '..' not in entry and not any(c in entry for c in '\\:\r\n\0')
    assert (root / entry).is_file(), entry
for path in root.rglob('*'):
    if '.git' not in path.relative_to(root).parts:
        assert not path.is_symlink(), path
for name in ['README.md', 'LICENSE', 'UPSTREAM_LICENSE', 'THIRD_PARTY_NOTICES.md', 'preview.png']:
    assert (root / name).is_file(), name
readme = (root / 'README.md').read_text()
assert 'omarchy plugin add https://github.com/nacho1706/omarchy-dock-window-counter' in readme
assert 'omarchy plugin remove chato.floating-apps' in readme
assert '<public-github-repository-url>' not in readme
for name in ['Service.qml', 'CounterWindow.qml', 'Model.js']:
    code = (root / name).read_text()
    assert 'serviceFor(' not in code and 'firstPartyServiceFor(' not in code, name + ' controls another service'
assert 'omarchy' not in manifest, 'overlay must not replace a dock service'
assert 'https://github.com/nacho1706/omarchy-dock-window-counter' == manifest['homepage']
print('Release structure, manifest, documentation, and independent overlay: OK')
