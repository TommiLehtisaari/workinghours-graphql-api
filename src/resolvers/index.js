const { userResolvers } = require('./userResolvers')
const { projectResolvers } = require('./projectResolvers')
const { taskResolvers } = require('./taskResolvers')
const { hourlogResolvers } = require('./hourlogResolvers')
const { scalarResolvers } = require('./scalarResolvers')
const _ = require('lodash')

const resolvers = _.merge(
  userResolvers,
  projectResolvers,
  taskResolvers,
  hourlogResolvers,
  scalarResolvers
)

module.exports = {
  resolvers
}
