@echo off
title CurateDrop Admin App Cloudflare Tunnel
echo ====================================================================
echo Starting Clean Cloudflare Tunnel for CurateDrop Admin (Port 3001)
echo ====================================================================
cloudflared tunnel --config "%~dp0tunnel_temp.yml" --url http://127.0.0.1:3001
pause
