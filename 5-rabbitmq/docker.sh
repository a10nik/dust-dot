eval $(docker-machine env)

netsh interface portproxy add v4tov4 listenaddress=127.0.0.1 listenport=80 connectaddress=192.168.99.100 connectport=80
docker rm -f some-rabbit
docker run -d --hostname my-rabbit --name some-rabbit rabbitmq:3.6
docker rm -f pika
docker build -t pika .
docker run --name pika --link some-rabbit:rabbit -p 80:80 -t pika sh run-stats.sh