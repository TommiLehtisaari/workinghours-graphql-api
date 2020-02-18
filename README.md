# workinghours-graphql-api

# Prerequisites

## Install node.js

Install [node](https://nodejs.org/en/download/).

Example node install instructions for debian based distros node 13.x:

```
sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -

sudo apt -y install nodejs
```

Example on macOS

```
brew install node@13
```

## Install packages

Install all packages with `npm install`

## Install mongodb locally (optional)

This can be skipped by using different database provider for example a cloud service like [mongodb atlas](https://www.mongodb.com/cloud/atlas).

If you use external database in your local development and in your integration tests be sure to check out how [node-config](https://www.npmjs.com/package/config) works. This project is configured with node-config. All the configuration files can be found from `./config`-folder. For example you can change `db`variable from `development.json` file.

Install mongodb on macOS Quick guide:

```
brew install mongodb
```

for more indepth and up to date guide refet to:
[mongodb official website](https://docs.mongodb.com/manual/installation/)

once installed you might need to point database location:
by default mongo uses `/data/db`
but you can point new path where ever you like by:

```
mkdir ~/data/db
mongod --dbpath ~/data/db
```

You also might need to run mongo-daemon on another open terminal if not set to run as a service with command:

```
mongod
```

Thhis starts mongodb server and listens on `PORT: 27017`.

# Environment variables

- `JWT_SECRET=<Secret encryption key (required)>`
- `MONGODB_URI=<database connection (required)>`

# Running development server

Graphql-api uses nodemon to watch files and run server.

As default development and test environment expects that you have mongodb running on your local machine `mongodb://localhost:27017`

You can start development server by:

`yarn watch`
