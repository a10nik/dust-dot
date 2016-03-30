###What does it do
It parses 4 main [OpenGraph](http://ogp.me/) headers of the site fed into it

###Structure
Consists of 2 apps:
* og-app - Ruby-on-Rails app, that draws bootstrap-ish interface to input site url
* og-service - RPC-service written in Haskell (cause I love FP),
which actually does all the site requesting and the HTML meta tag parsing

They communicate with the only relict RPC schema-based protocol, that somehow lived
 to tell its tail: [Thift](https://thrift.apache.org).

It turns out, Thrift does not like their precious library to be freely used by some profanes, that's why in order to
get it running you'll have to download their sources, fix a couple of compatibility problems and after a couple of weeks
struggling through C++ code you'll likely have passed the initiation ritual to be rewarded with an executable, that only runs on
your computer during the full moon with you dancing in circles around it.
And all that just to happily run it merely twice per the whole project's lifetime for it
to generate some painful-to-load sources, that you could probably have written yourself already.
Luckily, there is a [Docker](https://www.docker.com/)-image that
contains a runnable version of Thrift that was bestowed to us by some selfless people having marched through all
these rings of hell for the greater good of their fellow developers like me.

To make a long story short, I'll be using this image to generate Thrift-specific sources for both apps.

###How to run

To run this one, you'll need:

* Docker
* Ruby-on-Rails
* Stack for Haskell

After you gather all required ingredients, come to a sacred stone and whisper:

``cd dust-dot/1-thrift/
sh thrift-get.sh``

After that you'll get your thrift-files generated and placed accordingly. Now you'll be able to:


``cd dust-dot/1-thrift/og-service
stack exec og-service # to run the Haskell part``

and 

``cd dust-dot/1-thrift/og-app
bin/rails server # to run the Ruby part``

To deploy you'll need:
* Docker
* Heroku Toolbelt
* Stack for Haskell
* x64 Ubuntu (cause we only deploy the Haskell binaries to Heroku and need to build them locally)

Having all this stuff meticulously installed and logged into heroku, replace the ``$app`` variable
in ``dust-dot/1-thrift/heroku.sh`` with your heroku app name of choice and run the script

``cd dust-dot/1-thrift
sh heroku.sh``
