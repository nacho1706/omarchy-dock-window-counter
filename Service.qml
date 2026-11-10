import QtQuick
import Quickshell
import Quickshell.Hyprland
import Quickshell.Io
import "Model.js" as Model

Item {
  id: root
  property var shell: null
  property var manifest: null
  property var config: ({})
  property var defaults: ({})
  readonly property var dockConfig: config.dock || ({})
  readonly property string position: Model.normalizePosition(dockConfig.position)
  property string terminalId: ""

  FileView {
    path: (Quickshell.env("XDG_CONFIG_HOME") || Quickshell.env("HOME") + "/.config") + "/omarchy/shell.json"
    watchChanges: true
    onFileChanged: reload()
    onLoaded: { try { root.config = JSON.parse(text()) } catch(e) { console.warn("Dock Window Counter: invalid shell config") } }
  }
  FileView {
    path: (Quickshell.env("OMARCHY_PATH") || "/usr/share/omarchy") + "/config/omarchy/shell.json"
    onLoaded: { try { root.defaults = JSON.parse(text()) } catch(e) {} }
  }
  Process {
    command: ["xdg-terminal-exec", "--print-id"]
    running: true
    stdout: StdioCollector {
      onStreamFinished: {
        var id = text.trim().split(":")[0].replace(/\.desktop$/, "")
        if (/^[A-Za-z0-9._-]{1,160}$/.test(id)) root.terminalId = id
      }
    }
  }

  readonly property var terminalEntries: {
    var values = DesktopEntries.applications.values
    return values.filter(function(e) { return e.runInTerminal || String(e.execString || "").indexOf("--app-id=") >= 0 })
  }
  function entryForAppId(appId) {
    var entry = DesktopEntries.heuristicLookup(appId)
    if (entry) return entry
    var id = Model.claimingEntryId(appId, root.terminalEntries)
    return id ? DesktopEntries.byId(id) : null
  }
  function entryForCount(appId) {
    return root.entryForAppId(Model.canonicalAppId(appId, root.terminalId))
  }

  // Mirror only the native dock's public pins and window order. No dock is
  // launched, patched, focused, or controlled by this service.
  readonly property var items: {
    var appsRevision = DesktopEntries.applications.values.length
    var pins = Model.pinnedIds(root.dockConfig, root.defaults.dock || {}).filter(function(id) { return !!DesktopEntries.byId(id) })
    var windows = []
    var values = Hyprland.toplevels.values
    for (var i = 0; i < values.length; i++) {
      var h = values[i], t = h.wayland
      if (!t || !t.appId || t.parent) continue
      var entry = root.entryForAppId(t.appId), ws = h.workspace
      windows.push({ key: entry ? entry.id : t.appId, hasEntry: !!entry && !entry.noDisplay,
        workspaceId: ws ? ws.id : -1, minimized: !!ws && Model.isMinimizedWorkspace(ws.name) })
    }
    return Model.buildItems(pins, windows)
  }

  Connections {
    target: Hyprland
    function onRawEvent(event) {
      if (["fullscreen", "movewindowv2", "moveworkspacev2", "configreloaded"].indexOf(String(event.name)) >= 0) {
        Hyprland.refreshMonitors()
        Hyprland.refreshWorkspaces()
        Hyprland.refreshToplevels()
      }
    }
  }
  Variants {
    model: Quickshell.screens
    delegate: Component {
      CounterWindow {
        required property var modelData
        screen: modelData
        counter: root
      }
    }
  }
}
