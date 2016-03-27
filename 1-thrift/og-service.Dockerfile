from haskell:7

add /og-service /og-service

workdir /og-service

run stack build

expose 9090

cmd ["stack", "exec", "og-service"]

