eval $(docker-machine env)

netsh interface portproxy add v4tov4 listenaddress=127.0.0.1 listenport=80 connectaddress=192.168.99.100 connectport=80 
docker rm -f zero
docker build -t zero .
docker run --name zero -p 80:80 -it zero bash
docker rm -f zero