FROM python:2.7-onbuild

RUN pip install -r requirements.txt

run mkdir /app

ADD master.py /app
ADD worker.py /app

WORKDIR /app
