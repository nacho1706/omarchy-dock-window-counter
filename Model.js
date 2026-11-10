// The dock's state that does not need Quickshell: where it sits, which apps it
// shows, and which window a click brings forward.

var POSITIONS = ["top", "bottom", "left", "right"]

function normalizePosition(value) {
  var position = String(value || "").trim().toLowerCase()
  return POSITIONS.indexOf(position) >= 0 ? position : "bottom"
}

function isVertical(position) {
  var normalized = normalizePosition(position)
  return normalized === "left" || normalized === "right"
}

function normalizeId(value) {
  var id = String(value || "").trim()
  if (id.slice(-8) === ".desktop") id = id.slice(0, -8)
  return id
}

function pinnedIds(dockConfig, defaultsConfig) {
  var source = dockConfig && Array.isArray(dockConfig.pinned) ? dockConfig.pinned
    : (defaultsConfig && Array.isArray(defaultsConfig.pinned) ? defaultsConfig.pinned : [])
  var ids = []
  for (var i = 0; i < source.length; i++) {
    var id = normalizeId(source[i])
    if (id && ids.indexOf(id) === -1) ids.push(id)
  }
  return ids
}

// Only app windows on regular workspaces belong in the dock. Helpers without a
// visible desktop entry, such as the agent window, and anything parked on a
// special workspace, such as the scratchpad, stay out of it. A minimized window
// always belongs, entry or not, since the dock is the only way back to it.
function isDockWindow(window) {
  if (!window || !window.key) return false
  if (window.minimized === true) return true
  return window.hasEntry === true && window.workspaceId >= 1
}

// Minimizing moves a window to this special workspace, and the dock brings it
// back.
var MINIMIZED_WORKSPACE = "special:minimized"

function isMinimizedWorkspace(name) {
  return String(name || "") === MINIMIZED_WORKSPACE
}

// A terminal app's window carries the app id its launcher gave the terminal,
// which no desktop entry names as its class. The entry that passes that app id
// claims it, and so does a terminal entry for the command Omarchy's TUI
// launcher named it after (org.omarchy.nvim for nvim). Entries are
// { id, execString, command, runInTerminal }.
function claimingEntryId(appId, entries) {
  var id = String(appId || "")
  if (!id) return ""
  var list = entries || []
  var flag = "--app-id=" + id
  for (var i = 0; i < list.length; i++) {
    var words = String(list[i].execString || "").split(/\s+/)
    if (words.indexOf(flag) >= 0) return list[i].id
  }
  if (id.indexOf("org.omarchy.") !== 0) return ""
  var command = id.slice("org.omarchy.".length)
  for (var j = 0; j < list.length; j++) {
    var program = String((list[j].command || [])[0] || "")
    if (list[j].runInTerminal && program.slice(program.lastIndexOf("/") + 1) === command) return list[j].id
  }
  return ""
}

// Pinned apps come first, in pin order, whether or not they run. Running apps
// that are not pinned follow in the order their first window appeared. Each
// window is { key, hasEntry, workspaceId, ... } where key is the desktop id of
// the entry that claims it.
function buildItems(pinned, windows) {
  var items = []
  var byKey = Object.create(null)

  function itemFor(key, isPinned) {
    if (!byKey[key]) {
      byKey[key] = { key: key, pinned: isPinned, windows: [] }
      items.push(byKey[key])
    }
    return byKey[key]
  }

  for (var i = 0; i < (pinned || []).length; i++) {
    if (pinned[i]) itemFor(pinned[i], true)
  }

  for (var j = 0; j < (windows || []).length; j++) {
    var window = windows[j]
    if (isDockWindow(window)) itemFor(window.key, false).windows.push(window)
  }

  return items
}

// Dock Window Counter: one monitor's active workspace only. Minimized windows keep
// their origin in stock Omarchy tags; never infer it from global focus.
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
      var match = String(tags[j]).match(/^omarchy-minimized-from-([1-9][0-9]*)$/)
        || String(tags[j]).match(/^[a-z0-9]+-workspace-([1-9][0-9]*)$/)
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

if (typeof module !== "undefined") module.exports = {
  normalizePosition: normalizePosition, isVertical: isVertical, normalizeId: normalizeId,
  pinnedIds: pinnedIds, isDockWindow: isDockWindow, isMinimizedWorkspace: isMinimizedWorkspace,
  claimingEntryId: claimingEntryId, buildItems: buildItems,
  workspaceCount: workspaceCount, canonicalAppId: canonicalAppId
}
