FROM python:2.7-onbuild

RUN pip install -r requirements.txt

run mkdir /app

ADD send.py /app
ADD receive.py /app
ADD run-stats.sh /app
ADD static /app/static

WORKDIR /app
