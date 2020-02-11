const { ForbiddenError } = require('apollo-server')

const projectResolvers = {
  Query: {
    allProjects: (_, args, { dataSources }) => {
      return dataSources.projectDatabase.getProjects()
    },
    projectById: (_, args, { dataSources }) => {
      return dataSources.projectDatabase.getProjectById(args.id)
    }
  },
  Mutation: {
    createProject: async (root, args, { currentUser, dataSources }) => {
      if (!currentUser || !currentUser.admin) {
        throw new ForbiddenError(
          'Creating new Project requires Admin privileges.'
        )
      }
      const result = await dataSources.projectDatabase.createProject({
        name: args.name
      })
      return result
    },
    updateProject: async (root, args, { currentUser, dataSources }) => {
      if (!currentUser || !currentUser.admin) {
        throw new ForbiddenError('Editing a Project requires Admin privileges.')
      }
      const result = await dataSources.projectDatabase.updateProject({
        id: args.id,
        name: args.name
      })
      return result
    }
  },
  Project: {
    tasks: async (root, _, { dataSources }) => {
      const tasks = await dataSources.projectDatabase.getProjectTasks(root.id)
      return tasks
    },
    hours: async (root, args, { dataSources }) => {
      const hourlogs = await dataSources.hourlogDatabase.getHourlogsByProjectRoot(
        { root, dateTo: args.dateTo, dateFrom: args.dateFrom }
      )
      const hours = hourlogs.reduce((accum, current) => {
        return (accum += current.hours)
      }, 0)
      return hours
    },
    cost: async (root, args, { dataSources }) => {
      const hourlogs = await dataSources.hourlogDatabase.getHourlogsByProjectRoot(
        { root, dateTo: args.dateTo, dateFrom: args.dateFrom }
      )

      const cost = hourlogs.reduce((accum, current) => {
        return (accum += current.hours * current.user.payByHour)
      }, 0)

      return Math.floor(cost * 100) / 100
    },
    hourlogs: async (root, args, { dataSources }) => {
      return dataSources.hourlogDatabase.getHourlogsByProjectRoot({
        root,
        dateTo: args.dateTo,
        dateFrom: args.dateFrom
      })
    }
  }
}

module.exports = {
  projectResolvers
}
