docker build -t thrift-gen -f thrift.Dockerfile .
docker rm -f thrift-gen
docker run --name thrift-gen -it thrift-gen
rm -rf ./thrift-gen
docker cp thrift-gen:./thrift-data/generated ./thrift-gen
