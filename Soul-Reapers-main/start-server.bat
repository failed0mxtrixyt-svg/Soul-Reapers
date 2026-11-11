@echo off
cd /d "%~dp0"
echo Starting Soul Reapers Esports Website Server...

where python >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\Python\Python312\Scripts;%LOCALAPPDATA%\Programs\Python\Python312;%PATH%"
    ) else (
        echo.
        echo Python was not found. Please install Python from https://python.org
        echo Then run this file again.
        pause
        exit /b 1
    )
)

if not exist ".venv\Scripts\python.exe" (
    echo Installing dependencies...
    python -m pip install -r requirements.txt -q
)

echo Opening website in browser...
start "" http://localhost:8080
python server.py
pause
