eval $(docker-machine env)
docker build -t hadoop .
docker rm -f hadoop
docker run --name hadoop -t hadoop echo "Starting image"
docker cp hadoop:/usr/local/hadoop/foutput/part-00000 foutput.txt