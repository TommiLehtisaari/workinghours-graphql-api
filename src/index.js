const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint() {
  console.info(
    'Got SIGINT (aka ctrl-c in docker). Graceful shutdown ',
    new Date().toISOString()
  )
  shutdown()
})

// quit properly on docker stop
process.on('SIGTERM', function onSigterm() {
  console.info(
    'Got SIGTERM (docker container stop). Graceful shutdown ',
    new Date().toISOString()
  )
  shutdown()
})

// shut down server
function shutdown() {
  // NOTE: server.close is for express based apps
  // If using hapi, use `server.stop`
  server.close(function onServerClosed(err) {
    if (err) {
      console.error(err)
      process.exitCode = 1
    }
    process.exit()
  })
}

const {
  UserDatabase,
  ProjectDatabase,
  TaskDatabase,
  HourlogDatabase
} = require('./datasources')
const { typeDefs } = require('./typeDefs')
const { resolvers } = require('./resolvers')

// This is declared here for context authentication
const userDatabase = new UserDatabase()

const dataSources = () => ({
  userDatabase,
  projectDatabase: new ProjectDatabase(),
  taskDatabase: new TaskDatabase(),
  hourlogDatabase: new HourlogDatabase()
})

const context = async ({ req }) => {
  const auth = req ? req.headers['x-auth-token'] : null
  if (auth) {
    const decodedToken = jwt.verify(auth, JWT_SECRET)
    const currentUser = await userDatabase.getUserById(decodedToken.id)
    return { currentUser }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources,
  context
})

const app = express()

server.applyMiddleware({ app })
const PORT = process.env.PORT || 4000
const environment = process.env.NODE_ENV

if (environment !== 'test') {
  app.listen(PORT, () => {
    if (environment === 'development') {
      console.log(
        `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
      )
      console.log(`mode: ${process.env.NODE_ENV}`)
    }
  })
}

// export all the important pieces for integration/e2e tests to use
module.exports = {
  dataSources,
  context,
  typeDefs,
  resolvers,
  ApolloServer,
  server
}
