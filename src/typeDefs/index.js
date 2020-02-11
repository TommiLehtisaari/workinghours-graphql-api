const { query } = require('./query')
const { mutation } = require('./mutation')
const { userTypes, projectTypes, taskTypes, hourlogTypes } = require('./types')

const typeDefs = [
  query,
  mutation,
  userTypes,
  projectTypes,
  taskTypes,
  hourlogTypes
]

module.exports = {
  typeDefs
}
