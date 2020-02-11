const { gql } = require('apollo-server')

const query = gql`
  type Query {
    allUsers: [User]
    allProjects: [Project!]
    projectById(id: String!): Project
    allTasks: [Task]
    allHourlogs(dateFrom: String, dateTo: String): [Hourlog]
    myHourlogs(dateFrom: String, dateTo: String): [Hourlog]
  }
`

module.exports = {
  query
}
