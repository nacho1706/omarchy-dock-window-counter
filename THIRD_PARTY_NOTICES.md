# Third-party notices

`dock/Dock.qml`, `dock/DockWindow.qml`, `dock/DockModel.js`, and `dock/AppGrid.qml` are adapted from the installed Omarchy Quattro native dock, copyright David Heinemeier Hansson, MIT license reproduced in `dock/LICENSE`.

Modifications: current-workspace running indicators, exact duplicate-window counts, a dimmed icon when the app has no windows in the active workspace, and grouping Omarchy agent terminals with the configured terminal app. The service facade and optional Genie adapter are original Dock Window Counter code under the root MIT license.

The optional adapter changes only the user's existing `chato.genie` dock files. It preserves Genie code, license, animation ownership, app grid, pins, and activation behavior. The adapter is dormant when Dock Window Counter is disabled or removed. Backups allow complete source restoration.
