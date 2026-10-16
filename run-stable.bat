@echo off
setlocal enabledelayedexpansion

set NODE_PATH=C:\Users\kelvi\AppData\Local\Temp\kilo\node_extracted\node-v20.18.0-win-x64
set PATH=%NODE_PATH%;%PATH%
set PROJECT=C:\Users\kelvi\AppData\Local\Temp\kilo\olho-build

:restart
echo [%time%] Iniciando server Next.js...
cd /d "%PROJECT%"
start /b cmd /c "npm run dev" > server.log 2>&1
echo [%time%] Aguardando server ficar pronto...

REM Wait for server to be ready
:wait_ready
timeout /t 5 /nobreak > nul
curl -s -o NUL -w "%%{http_code}" http://localhost:3000/auth/login 2>&1 | findstr "200" > nul
if errorlevel 1 (
  echo [%time%] Server nao pronto, tentando novamente...
  goto wait_ready
)

echo [%time%] Server pronto! Iniciando tunnel...

REM Generate random subdomain to avoid 503 conflicts
set SUB=olho-!random!-!random!

:loop
echo [%time%] Iniciando tunnel localtunnel...
cd /d "%PROJECT%"
lt --port 3000 --subdomain %SUB% --print-requests > tunnel.log 2>&1
set LT_EXIT=!errorlevel!

echo [%time%] Tunnel terminou (exit=!LT_EXIT!). Reiniciando em 3s...
timeout /t 3 /nobreak > nul
goto restart