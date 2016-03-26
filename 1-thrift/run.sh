docker rm -f og-service
docker rm -f web-app
docker network rm -r simple-network
docker network create simple-network
docker run --name og-service --net simple-network -dit og-service bash
docker run --name web-app --net simple-network -dit web-app bash
