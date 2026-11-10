### Repository URL

https://github.com/nacho1706/omarchy-dock-window-counter

### Category

Desktop

### Tags

hyprland, quickshell, workspaces

### Suggest a missing tag

dock

### Maintainer notes

Independent, click-through indicators over an already-visible Omarchy native floating dock. A dot marks one window and a badge shows the exact count of multiple windows on the active workspace of each monitor. Minimized windows use their saved original workspace metadata. Agent terminals count with the configured terminal app.

The plugin is a separate service: it does not replace a dock, launch apps, intercept input, or patch/import any other third-party plugin. Its ordering model is derived from Omarchy's MIT-licensed dock model, with attribution retained in UPSTREAM_LICENSE. No network polling, additional runtime packages, privileged operations, or configuration writes. The existing terminal-selection command is queried once.

The manifest, release structure, nine model tests, Qt 6 syntax checks and live two-window workspace migration have been checked. Indicators require native dock geometry and hide with autohide/maximized/fullscreen workspaces. Detailed coverage and limits are in VERIFICATION.md.

### Submission checklist

- [ ] The repository is public and contains installation and removal instructions.
- [ ] I have documented the plugin license and any external dependencies.
- [ ] I confirm that I own or have permission to submit this plugin and its preview assets.
- [ ] The plugin does not overwrite user configuration without explicit consent.
- [ ] I understand that approval is for listing and is not a security review.
