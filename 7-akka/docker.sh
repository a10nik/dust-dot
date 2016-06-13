eval $(docker-machine env)

docker rm -f akka
docker build -t akka .
docker run --name akka -it akka bash
docker rm -f akka