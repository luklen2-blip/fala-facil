@echo off
title FalaFacil Balcao - Servidor 24/7
chcp 65001 >nul
cls
echo ========================================================
echo   FALAFACIL BALCAO - COMUNICACAO ACESSIVEL NO BALCAO
echo ========================================================
echo.
cd /d "C:\Users\luciano\.gemini\antigravity\scratch\falafacil-balcao"

echo [1/2] Verificando integridade da aplicacao...
node tests/run_all.js
if %errorlevel% neq 0 (
  echo.
  echo [ERRO] Falha nos testes locais. Abortando inicializacao.
  pause
  exit /b %errorlevel%
)

echo.
echo [2/2] Servidor pronto. Iniciando FalaFacil Balcao...
set AUTO_OPEN=true
node server.js
pause
