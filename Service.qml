import QtQuick
import Quickshell
import Quickshell.Io
import "dock" as NativeDock

Item {
  id: root
  property var shell: null
  property var manifest: null
  property var config: ({})
  property var defaults: ({})
  readonly property bool genieEnabled: (config.plugins || []).some(function(p) { return p.id === "chato.genie" }) && (config.disabledPlugins || []).indexOf("chato.genie") < 0

  FileView {
    path: (Quickshell.env("XDG_CONFIG_HOME") || Quickshell.env("HOME") + "/.config") + "/omarchy/shell.json"
    watchChanges: true
    onFileChanged: reload()
    onLoaded: { try { root.config = JSON.parse(text()) } catch(e) { console.warn("Floating Apps: invalid shell config") } }
  }
  FileView {
    path: (Quickshell.env("OMARCHY_PATH") || "/usr/share/omarchy") + "/config/omarchy/shell.json"
    onLoaded: { try { root.defaults = JSON.parse(text()) } catch(e) {} }
  }
  QtObject {
    id: facade
    property var shellConfig: root.config
    property var defaultsConfig: root.defaults
    property var appLibrary: root.shell ? root.shell.appLibrary : null
  }
  // Genie already owns a native dock. Its optional adapter draws these
  // indicators there; never create a competing surface or animation target.
  Loader {
    active: !root.genieEnabled && Object.keys(root.config).length > 0
    sourceComponent: Component { NativeDock.Dock { shell: facade } }
  }
}
