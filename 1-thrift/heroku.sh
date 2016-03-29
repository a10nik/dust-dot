cd $1
rm -rf .git
git init
git add .
git commit -am "init"
app=$2
heroku create $app
heroku buildpacks:set -a $app $3
heroku git:remote -a $app
git push -f heroku master
