@echo off
setlocal
set PATH=C:\Users\kelvi\AppData\Local\Temp\kilo\node_extracted\node-v20.18.0-win-x64;%PATH%
echo Starting "Olho Que Tudo Vê" dev server...
cd /d "C:\Users\kelvi\AppData\Local\Temp\kilo\olho-build"
npm run dev
pause