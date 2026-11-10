### Repository URL

https://github.com/nacho1706/omarchy-floating-apps

### Category

Desktop

### Tags

hyprland, quickshell, workspaces

### Suggest a missing tag

dock

### Maintainer notes

Adds current-workspace window indicators to Omarchy's native floating dock: an outlined dot for one window and an exact count badge for multiple windows. Minimized windows count on their original workspace. Omarchy agent terminal aliases count with the configured terminal app.

The stock-dock implementation is a user-owned fork of Omarchy's MIT-licensed native dock, with the upstream license preserved. An optional, explicitly invoked adapter supports the user-owned Genie 0.2.4 dock; it validates expected source anchors, creates backups, and makes no changes if the source layout is unsupported. It does not modify packaged Omarchy files. Disable/removal makes the Genie integration dormant; complete source restoration is documented.

No additional runtime dependencies, network polling, elevated privileges, or external downloads. The adapter requires Python 3; Node.js is a development-only test dependency. Existing Omarchy commands continue to handle native app launching and dock settings.

Live-tested on the Genie-equipped desktop. The standalone stock-dock path passes static/QML checks but has not been live-activated on that desktop; mixed DPI and alternate dock positions need broader testing. Details are in VERIFICATION.md.

### Submission checklist

- [ ] The repository is public and contains installation and removal instructions.
- [ ] I have documented the plugin license and any external dependencies.
- [ ] I confirm that I own or have permission to submit this plugin and its preview assets.
- [ ] The plugin does not overwrite user configuration without explicit consent.
- [ ] I understand that approval is for listing and is not a security review.
