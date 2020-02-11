const { gql } = require('apollo-server')

const taskTypes = gql`
  type Task {
    id: ID!
    project: Project!
    name: String!
    description: String
    color: Int!
    hours(dateFrom: String, dateTo: String): Float
    cost(dateFrom: String, dateTo: String): Float
  }
`

module.exports = { taskTypes }
