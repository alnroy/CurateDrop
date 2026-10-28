@echo off
echo Starting CurateDrop Full Stack...
start "CurateDrop Django Backend" cmd /k "cd /d C:\Users\asus\Desktop\CurateDrop\backend && python manage.py runserver 0.0.0.0:8000"
timeout /t 3
start "CurateDrop Customer Website (Port 3000)" cmd /k "cd /d C:\Users\asus\Desktop\CurateDrop\website && npm run dev"
timeout /t 2
start "CurateDrop Admin Mobile App (Port 3001)" cmd /k "cd /d C:\Users\asus\Desktop\CurateDrop\admin_app && npm run dev"
echo All services launched!
