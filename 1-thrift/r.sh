echo "r-ing $1"
docker build -t $1 -f "$1.Dockerfile" .
docker rm -f $1
docker network rm simple-network
docker network create simple-network
docker run --name $1 --net simple-network -dit $1 $2