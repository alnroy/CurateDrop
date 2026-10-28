@echo off
title CurateDrop Website Cloudflare Tunnel
echo ====================================================================
echo Starting Clean Cloudflare Tunnel for CurateDrop Website (Port 3000)
echo ====================================================================
cloudflared tunnel --config "%~dp0tunnel_temp.yml" --url http://127.0.0.1:3000
pause
