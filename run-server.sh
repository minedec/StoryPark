source storyparkserver/venv/bin/activate
cd storyparkserver
pkill -9 -f gunicorn
nohup gunicorn -w 4 -b 0.0.0.0:8000 app:app > nohup-server.out 2>&1 &
