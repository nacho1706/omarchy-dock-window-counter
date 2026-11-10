  // Floating Apps terminal identity: read the selected terminal once, without
  // launching it. Agent terminals should contribute to the same dock count.
  property string floatingAppsTerminalId: ""
  Process {
    command: ["xdg-terminal-exec", "--print-id"]
    running: true
    stdout: StdioCollector {
      onStreamFinished: {
        var id = text.trim().split(":")[0].replace(/\.desktop$/, "")
        if (/^[A-Za-z0-9._-]{1,160}$/.test(id)) root.floatingAppsTerminalId = id
      }
    }
  }
