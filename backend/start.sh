ps aux |grep uvicorn |grep -v grep |awk '{print $2}' |xargs kill
nohup uvicorn main:app --host 0.0.0.0 --port 8000 < /dev/null > server.log 2>&1 &
