from ruby:2.1

add /web-app /web-app
add /og-service /og-service

workdir /web-app

run bundle install

cmd ["ruby", "client.rb"]