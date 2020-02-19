const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

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
