#!/bin/bash
# Robust server startup script with error handling and auto-restart

cd "$(dirname "$0")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting FOG Platform Backend Server${NC}"
echo ""

# Function to kill existing processes on port 8000
kill_port_8000() {
    local pids=$(lsof -ti:8000 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}⚠️  Killing existing processes on port 8000...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null
        sleep 2
    fi
}

# Function to check if server is running
check_server() {
    curl -s http://localhost:8000/api/health > /dev/null 2>&1
    return $?
}

# Activate virtual environment
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Creating virtual environment...${NC}"
    python3 -m venv venv
fi

echo -e "${GREEN}🔧 Activating virtual environment...${NC}"
source venv/bin/activate

# Install/update dependencies
echo -e "${GREEN}📦 Checking dependencies...${NC}"
pip install -q -r requirements.txt

# Kill any existing processes
kill_port_8000

# Initialize file storage
echo -e "${GREEN}📁 Initializing file storage...${NC}"
python file_server.py

# Start server with error handling
echo ""
echo -e "${GREEN}🚀 Starting server...${NC}"
echo -e "   Server: ${GREEN}http://localhost:8000${NC}"
echo -e "   API Docs: ${GREEN}http://localhost:8000/docs${NC}"
echo -e "   Health: ${GREEN}http://localhost:8000/api/health${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Trap Ctrl+C to clean up
trap 'echo ""; echo -e "${YELLOW}Stopping server...${NC}"; kill_port_8000; exit 0' INT TERM

# Start server and monitor
while true; do
    python main.py 2>&1 | tee server.log
    
    # If server exits, check if it was intentional
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}Server stopped normally${NC}"
        break
    else
        echo -e "${RED}❌ Server crashed with exit code $exit_code${NC}"
        echo -e "${YELLOW}Last 20 lines of server.log:${NC}"
        tail -20 server.log
        echo ""
        echo -e "${YELLOW}Restarting in 5 seconds... (Press Ctrl+C to stop)${NC}"
        sleep 5
        kill_port_8000
    fi
done

