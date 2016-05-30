eval $(docker-machine env)
docker build -t spark .
docker rm -f spark
docker run --name spark -it spark bash
