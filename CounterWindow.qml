import QtQuick
import Quickshell
import Quickshell.Hyprland
import Quickshell.Wayland
import Quickshell.Io
import qs.Commons
import qs.Commons as Commons
import "Model.js" as Model

PanelWindow {
  id: window
  required property var counter
  readonly property var monitor: Hyprland.monitorFor(screen)
  readonly property int workspaceId: monitor && monitor.activeWorkspace ? monitor.activeWorkspace.id : -1
  readonly property string position: counter.position
  readonly property bool vertical: Model.isVertical(position)
  readonly property int iconSize: Math.round(36 * Style.fontScale)
  readonly property int iconInset: Style.spacing.md
  readonly property int slotSize: iconSize + iconInset * 2
  readonly property int gap: Style.spacing.xs
  readonly property string stateDir: (Quickshell.env("XDG_STATE_HOME") || Quickshell.env("HOME") + "/.local/state") + "/omarchy/workspace-layouts/"
  property string workspaceMode: ""
  property string defaultMode: ""
  readonly property int fullscreenMode: {
    var mode = 0, values = Hyprland.toplevels.values
    for (var i = 0; i < values.length; i++) {
      if (values[i].workspace && values[i].workspace.id === window.workspaceId)
        mode = Math.max(mode, Number((values[i].lastIpcObject || {}).fullscreen) || 0)
    }
    return mode
  }
  // Native auto-hide/reveal state is private to the dock. Hide markers in
  // that mode rather than leaving them suspended over a hidden dock.
  readonly property bool shown: (workspaceMode || defaultMode) === "floating"
    && fullscreenMode === 0 && counter.dockConfig.autohide !== true

  function readMode(text, field) {
    var match = String(text).match(new RegExp("\\b" + field + "\\s*=\\s*\"(floating|dwindle|scrolling)\""))
    return match ? match[1] : ""
  }
  FileView {
    path: window.workspaceId > 0 ? window.stateDir + window.workspaceId + ".lua" : ""
    watchChanges: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: window.workspaceMode = window.readMode(text(), "mode")
    onLoadFailed: window.workspaceMode = ""
  }
  FileView {
    path: window.stateDir + "default.lua"
    watchChanges: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: window.defaultMode = window.readMode(text(), "default")
    onLoadFailed: window.defaultMode = ""
  }
  onWorkspaceIdChanged: window.workspaceMode = ""

  color: "transparent"
  WlrLayershell.namespace: "omarchy-dock-window-counter"
  WlrLayershell.layer: WlrLayer.Overlay
  WlrLayershell.keyboardFocus: WlrKeyboardFocus.None
  exclusionMode: ExclusionMode.Normal
  exclusiveZone: 0
  // Empty input region: all clicks, drags, and hover reach the existing dock.
  mask: Region {}
  anchors {
    top: window.position !== "bottom"
    bottom: window.position !== "top"
    left: window.position !== "right"
    right: window.position !== "left"
  }
  implicitWidth: vertical ? slotSize + gap : 0
  implicitHeight: vertical ? 0 : slotSize + gap

  Item {
    id: strip
    opacity: window.shown ? 1 : 0
    width: window.vertical ? window.slotSize : (counter.items.length + 1) * window.slotSize
    height: window.vertical ? (counter.items.length + 1) * window.slotSize : window.slotSize
    x: window.position === "left" ? window.gap : window.position === "right" ? window.width - width - window.gap : Math.round((window.width - width) / 2)
    y: window.position === "top" ? window.gap : window.position === "bottom" ? window.height - height - window.gap : Math.round((window.height - height) / 2)
    Repeater {
      model: counter.items
      Item {
        id: marker
        required property var modelData
        required property int index
        readonly property int count: Model.workspaceCount(Hyprland.toplevels.values, modelData.key, window.workspaceId, counter.entryForCount)
        x: (window.vertical ? 0 : (index + 1) * window.slotSize) + window.iconInset
        y: (window.vertical ? (index + 1) * window.slotSize : 0) + window.iconInset
        width: window.iconSize
        height: width
        visible: count > 0
        Rectangle {
          visible: marker.count === 1
          anchors.horizontalCenter: parent.horizontalCenter
          anchors.top: parent.bottom
          anchors.topMargin: Style.space(1)
          width: Style.space(6)
          height: width
          radius: width / 2
          color: "#ffffff"
          border.width: Math.max(1, Style.space(1))
          border.color: "#e61a1a1a"
        }
        Rectangle {
          visible: marker.count > 1
          anchors.right: parent.right
          anchors.bottom: parent.bottom
          anchors.rightMargin: -Style.space(2)
          anchors.bottomMargin: -Style.space(2)
          width: Math.max(Style.space(15), label.implicitWidth + Style.space(6))
          height: Style.space(15)
          radius: height / 2
          color: "#eb202020"
          border.width: Math.max(1, Style.space(1))
          border.color: "#b3ffffff"
          Text {
            id: label
            textFormat: Text.PlainText
            anchors.centerIn: parent
            text: Commons.I18n.formatNumber(marker.count)
            color: "#ffffff"
            font.family: Style.font.family
            font.pixelSize: Style.space(10)
            font.bold: true
          }
        }
      }
    }
  }
}
