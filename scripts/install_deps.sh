npm install
# we set/unset GIT_DIR for https://github.com/bower/bower/issues/1492
# this may collide in scenarios where GIT_DIR already set
# export needed b/c bower forks process(es)
export GIT_DIR=/home/vagrant/vagrant-dot-git && ./node_modules/.bin/bower install
unset GIT_DIR
echo "script finished..."