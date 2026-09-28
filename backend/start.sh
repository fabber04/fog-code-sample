#!/bin/bash

echo "Starting FOG (Family of Greatness) Backend..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "Virtual environment created!"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Initialize database if it doesn't exist
if [ ! -f "fog_platform.db" ]; then
    echo "Initializing database..."
    python init_db.py
    echo "Database initialized!"
fi

# Start the server
echo
echo "Starting FastAPI server..."
echo "API will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo
echo "Press Ctrl+C to stop the server"
echo

python main.py
