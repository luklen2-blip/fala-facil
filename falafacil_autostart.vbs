Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\luciano\.gemini\antigravity\scratch\falafacil-balcao"
WshShell.Run "cmd /c node start_tunnel.js", 0, False
