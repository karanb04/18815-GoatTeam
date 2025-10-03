#!/bin/bash

echo "🚀 Starting UT Hardware Portal..."

# Check if required directories exist
if [ ! -d "client" ]; then
    echo "❌ Client directory not found"
    exit 1
fi

if [ ! -d "server" ]; then
    echo "❌ Server directory not found"
    exit 1
fi

echo "📦 Installing server dependencies..."
cd server
pip3 install -r requirements.txt
cd ..

echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo "🔧 Starting server..."
cd server
python3 app.py &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"
cd ..

sleep 3

echo "🎨 Starting client..."
cd client
npm start &
CLIENT_PID=$!
echo "Client started with PID: $CLIENT_PID"
cd ..

echo ""
echo "✅ Both services are starting up!"
echo "📱 Client: http://localhost:3000"
echo "🔌 Server: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both services"

cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $SERVER_PID 2>/dev/null
    kill $CLIENT_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

wait