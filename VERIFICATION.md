# Verification

Independent overlay release 1.1.0, checked on Omarchy Quattro on 2026-11-10.

- Official local Omarchy manifest validator and offline release checks pass.
- Nine model cases cover duplicate windows, workspace isolation, minimized origin metadata, terminal aliases, moves/closures, and the empty overlay input region.
- Qt 6 syntax validation passes with offline Omarchy host-import warnings.
- Live compositor inspection shows one existing native dock surface and one separate `omarchy-dock-window-counter` surface per monitor.
- The existing dock provider remains enabled and its original source files were restored and verified against the backups from before counter integration.
- Two disposable Foot windows on workspace 11 produce a visible `2` badge over the existing terminal icon. Moving one to workspace 12 removes it from workspace 11's count.
- Test windows are closed after verification. The overlay has no mouse handlers, keyboard focus, or reserved screen area.

Autohide/reveal synchronization is intentionally unsupported; markers hide while autohide is configured or a workspace has a maximized/fullscreen window. Geometry follows native dock settings and settles after a drag. Alternate icon layouts, mixed DPI, and monitor hotplug need broader testing.

The root plugin ID was absent from the public marketplace catalog and retired-ID registry when checked on 2026-11-10; availability must be rechecked when submitting. Hosted CI runs release structure and model checks. Marketplace security approval has not been requested or obtained.
