@echo off
echo ==========================================
echo      Starting BusTrack AI Server
echo ==========================================

cd backend

if not exist node_modules (
    echo [INFO] Dependencies not found. Installing...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b %errorlevel%
    )
    echo [SUCCESS] Dependencies installed.
)

echo [INFO] Starting Node.js server...
npm start

pause