Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\luciano\.gemini\antigravity\scratch\falafacil-balcao"
WshShell.Run "cmd /c node server.js", 0, False
