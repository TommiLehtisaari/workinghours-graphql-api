const { gql } = require('apollo-server')

const hourlogTypes = gql`
  scalar Date

  type Hourlog {
    id: ID!
    date: Date!
    hours: Float!
    user: User
    task: Task!
  }
`

module.exports = { hourlogTypes }
