
@echo off
echo Starting LSAuto Ecosystem...
start "LSAuto Backend" cmd /k "node backend-server.js"
echo Backend started.
echo Starting LSAuto Frontend...
npm run dev -- --host
pause
