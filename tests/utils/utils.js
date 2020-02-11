const { ApolloServer } = require('apollo-server')
const {
  typeDefs,
  resolvers,
  dataSources,
  context: defaultContext
} = require('../../src/index')

const constructTestServer = ({ context = defaultContext } = {}) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources,
    context
  })

  return server
}

module.exports.constructTestServer = constructTestServer
