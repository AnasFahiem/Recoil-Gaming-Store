@echo off
echo ==========================================
echo      RECOIL - Auto-Deploy
echo ==========================================
echo.

:: Add Node and NPM Global to PATH to ensure we find 'vercel'
set "PATH=%PATH%;C:\Program Files\nodejs;%APPDATA%\npm"

echo [INFO] Attempting deployment...
echo (If this fails, please check the error message below)
echo.

:: Run deployment forcefully
call vercel --prod --yes

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Deployment failed.
    echo Please try running 'vercel --prod' manually in your terminal.
) else (
    echo.
    echo [SUCCESS] Deployment initiated! Check the link above.
)

pause
