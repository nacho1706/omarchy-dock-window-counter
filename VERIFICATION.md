# Verification

Validated on the installed Omarchy Quattro shell with Genie 0.2.4 on 2026-11-10.

- Omarchy manifest validator passed.
- Qt 6 QML syntax validation passed. Offline lint emits unresolved Omarchy `qs.*` host-import and inherited native-code warnings; the Qt 5 linter on PATH cannot parse the unmodified upstream Dock.qml. Live service/Genie loading produces no plugin errors.
- Six model cases passed (including plain-text sink checks): workspace isolation and duplicates; minimized origins; stale tags; desktop aliases; moves and closures.
- Live Genie dock: local running windows display a dot; a disposable second Foot window changed the dot into `2`.
- Moving that disposable window from workspace 5 to workspace 4 changed the active workspace's indicator back to a dot.
- Minimized Discord and Spotify windows tagged as originating on workspace 5 show local indicators there.
- Both monitor surfaces load without plugin errors. The existing top status bar contains no Floating Apps widget.
- Genie reports its launcher ready, no error and no animation busy state.
- Test windows were closed after checks; temporary logging was removed.

The standalone stock-dock path uses the same tested count/indicator implementation and passes QML lint, but has not been activated on this Genie-equipped desktop. Other dock positions, mixed DPI, monitor hotplug, and an end-to-end Genie animation after adapter installation have not been exhaustively tested.

## Visibility fix in 1.0.1

The initial dots blended into bright wallpaper and the text counts were too close to the screen edge. Added dark outlines to single-window dots and moved counts into contrasting badges over the icon's lower-right corner. Live verification with two disposable Foot windows on workspace 4 showed a fully visible `2`; moving one to workspace 5 changed it to an outlined dot. Both test windows were closed.

## Instance grouping fix in 1.0.2

A regular Foot window and an Omarchy agent terminal on workspace 5 had different app IDs (`foot` and `org.omarchy.agent`) and previously counted as one Terminal window. The dock now queries the configured terminal desktop ID once and groups the known agent alias under that terminal. The actual two windows now show `2` in the live dock. Added a regression case for that pair, workspace isolation, and preserving separate TUI identities; all seven cases pass. No temporary logging was added.

## Public release checks

Release structure and documentation checks pass. Seven model tests and three adapter safety tests pass, including original-file backups, idempotent reruns, upgrading an existing indicator, and refusing unknown source layouts without partial edits. The official local Omarchy plugin validator passes. The public marketplace catalog and retired-ID registry did not contain `chato.floating-apps` when checked on 2026-11-10; availability must be rechecked at submission. Hosted CI runs the offline structure, model, and adapter checks.
