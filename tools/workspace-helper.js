
// Floating Apps: one monitor's active workspace only. Minimized windows keep
// their origin in stock Omarchy or Genie tags; never infer it from global focus.
function workspaceCount(toplevels, key, workspaceId, entryForAppId) {
  if (!(workspaceId > 0)) return 0
  var count = 0
  for (var i = 0; i < toplevels.length; i++) {
    var h = toplevels[i], t = h.wayland
    if (!t || !t.appId || t.parent) continue
    var entry = entryForAppId(t.appId)
    if ((entry ? entry.id : t.appId) !== key) continue
    var ws = h.workspace
    if (!ws) continue
    if (ws.id === workspaceId) { count++; continue }
    if (ws.name !== "special:minimized") continue
    var tags = (h.lastIpcObject || {}).tags || []
    var origin = -1
    for (var j = 0; j < tags.length; j++) {
      var match = String(tags[j]).match(/^genie-workspace-([1-9][0-9]*)$/)
      if (match) { origin = Number(match[1]); break }
      match = String(tags[j]).match(/^omarchy-minimized-from-([1-9][0-9]*)$/)
      if (match) origin = Number(match[1])
    }
    if (origin === workspaceId) count++
  }
  return count
}

// Omarchy's agent uses the configured terminal with its own app-id. Keep
// dedicated TUI app identities (nvim, btop, etc.) independent.
function canonicalAppId(appId, terminalId) {
  return appId === "org.omarchy.agent" && terminalId ? terminalId : appId
}
