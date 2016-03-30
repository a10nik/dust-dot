sh ./thrift-gen.sh
cd og-service
mkdir ../og-app/og-service
stack install --local-bin-path ../og-app/og-service
cd ../og-app
git init
git add .
git commit -am "init"
app=dust1-og-app
heroku create $app
heroku buildpacks:set -a $app 'https://github.com/heroku/heroku-buildpack-ruby.git'
heroku git:remote -a $app
git push -f heroku master
rm -rf .git
rm -rf og-service
