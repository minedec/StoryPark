cd storyparkreact
npm run build
cd build
nohup http-server -p 3000 > http-server.log 2>&1 &
echo "HTTP server started on port 3000. Logs are being written to http-server.log"