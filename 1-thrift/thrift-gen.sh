docker build -t thrift-gen -f thrift.Dockerfile .
docker rm -f thrift-gen
docker run --name thrift-gen -it thrift-gen
hsgen="./og-service/gen-hs"
rbgen="./og-app/lib/og_client/gen-rb"
rm -rf $hsgen
rm -rf $rbgen
docker cp thrift-gen:./thrift-data/generated/gen-rb $rbgen
docker cp thrift-gen:./thrift-data/generated/gen-hs $hsgen
