#!/bin/bash
cd "$(dirname "$0")"
echo "Building project..."
npm run build
echo ""
echo "Starting server on http://localhost:8080"
echo "Press Ctrl+C to stop"
echo ""
python3 -m http.server 8080



