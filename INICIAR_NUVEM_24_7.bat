@echo off
title FalaFacil Balcao - Nuvem 24/7
chcp 65001 >nul
cls
echo ================================================================
echo   FALAFACIL BALCAO — INICIALIZADOR DE NUVEM GLOBAL 24/7
echo   Acessibilidade e Inclusao em Balcoes de Atendimento
echo ================================================================
echo.
cd /d "C:\Users\luciano\.gemini\antigravity\scratch\falafacil-balcao"

echo [1/2] Validando testes de integridade locais...
node tests/run_all.js
if %errorlevel% neq 0 (
  echo.
  echo [ERRO] Integridade comprometida. Abortando inicializacao de nuvem.
  pause
  exit /b %errorlevel%
)

echo.
echo [2/2] Iniciando aplicacao e tunel Cloudflare seguro 24/7...
node start_tunnel.js
pause
