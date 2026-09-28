#!/bin/bash
# Start FOG Platform Backend Server
# This script activates the virtual environment and starts the server

cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found!"
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo " Virtual environment created"
fi

# Activate virtual environment
echo " Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo " Installing dependencies..."
    pip install -r requirements.txt
    echo " Dependencies installed"
else
    # Ensure all dependencies are up to date
    echo " Checking dependencies..."
    pip install -q -r requirements.txt
fi

# Initialize file storage
echo " Initializing file storage..."
python file_server.py

# Start the server
echo " Starting FOG Platform Backend Server..."
echo "   Server will be available at: http://localhost:8000"
echo "   API docs at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python main.py

