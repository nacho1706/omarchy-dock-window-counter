    // Floating Apps indicators follow the icon during hover and dragging.
    Item {
      x: window.iconInset
      y: window.iconInset
      width: window.iconSize
      height: window.iconSize
      visible: window.workspaceIndicators && appSlot.localWindowCount > 0
      transform: Translate {
        x: window.vertical ? 0 : appSlot.displayedShift
        y: window.vertical ? appSlot.displayedShift : 0
      }
      Rectangle {
        visible: appSlot.localWindowCount === 1
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
        visible: appSlot.localWindowCount > 1
        // Keep the entire count inside the dock's slot, clear of the screen
        // edge. The backing makes it readable on light and busy wallpapers.
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        anchors.rightMargin: -Style.space(2)
        anchors.bottomMargin: -Style.space(2)
        width: Math.max(Style.space(15), countText.implicitWidth + Style.space(6))
        height: Style.space(15)
        radius: height / 2
        color: "#eb202020"
        border.width: Math.max(1, Style.space(1))
        border.color: "#b3ffffff"
        Text {
          id: countText
          textFormat: Text.PlainText
          anchors.centerIn: parent
          text: Commons.I18n.formatNumber(appSlot.localWindowCount)
          color: "#ffffff"
          font.family: Style.font.family
          font.pixelSize: Style.space(10)
          font.bold: true
        }
      }
    }
