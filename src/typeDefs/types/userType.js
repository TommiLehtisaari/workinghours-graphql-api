const { gql } = require('apollo-server')

const userTypes = gql`
  type User {
    username: String!
    name: String!
    admin: Boolean!
    id: ID!
    payByHour: Float
  }

  type Token {
    value: String!
  }
`

module.exports = { userTypes }
