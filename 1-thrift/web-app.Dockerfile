from ruby:2.1

add /web-app /web-app
add /thrift-gen/gen-rb /web-app/gen-rb

workdir /web-app

run bundle config build.thrift --with-cppflags='-D_FORTIFY_SOURCE=0'
run bundle install

cmd ["ruby", "client.rb"]