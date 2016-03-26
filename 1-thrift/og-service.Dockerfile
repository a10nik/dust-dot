from python:3

add /og-service /og-service

workdir /og-service

run pip install -r requirements.txt

expose 9090

cmd ["python3", "./server.py"]
