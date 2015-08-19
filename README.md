The Incarnate Word
==================

View and search through the works of Sri Aurobindo and the Mother.

### Requirements:

* Rails 4
* MongoDB

### Setup:

````
bundle install
bower install
cp config/application.example.yml config/application.yml (modify to your taste)
rake assets:precompile
git submodule init && git submodule update
rake db:seed
rake import:author['<author>']
rails s
````
