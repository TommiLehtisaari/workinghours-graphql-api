const { gql } = require('apollo-server')

const projectTypes = gql`
  type Project {
    id: ID!
    name: String!
    tasks: [Task]
    hours(dateFrom: String, dateTo: String): Float
    cost(dateFrom: String, dateTo: String): Float
    hourlogs(dateFrom: String, dateTo: String): [Hourlog]
  }
`

module.exports = { projectTypes }
