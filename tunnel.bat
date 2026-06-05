@echo off
echo ============================================
echo   Mango Learning OS - Cloudflare Tunnel
echo   https://devoted-turning-citizen-specialist.trycloudflare.com
echo ============================================
echo.
echo Starting dev server on port 3030...
start "Mango Dev Server" cmd /c "npm run dev -- -p 3030"
echo Waiting for server...
timeout /t 8 /nobreak >nul
echo Starting Cloudflare tunnel...
cloudflared.exe tunnel --url http://localhost:3030 --no-autoupdate
pause
