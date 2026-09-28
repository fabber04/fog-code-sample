@echo off
echo Starting FOG (Family of Greatness) Backend...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo Virtual environment created!
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/update dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Initialize database if it doesn't exist
if not exist "fog_platform.db" (
    echo Initializing database...
    python init_db.py
    echo Database initialized!
)

REM Start the server
echo.
echo Starting FastAPI server...
echo API will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py

pause
