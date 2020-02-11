const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language')
const moment = require('moment')

const scalarResolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value) // value from the client
    },
    serialize(value) {
      return moment(value).format('YYYY-MM-DD') // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value) // ast value is always in string format
      }
      return null
    }
  })
}

module.exports = { scalarResolvers }
