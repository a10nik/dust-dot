eval $(docker-machine env)
cd ranker
sbt package
cd ..
docker cp ranker/target/scala-2.10/ranker_2.10-0.1-SNAPSHOT.jar spark:/ranker.jar
