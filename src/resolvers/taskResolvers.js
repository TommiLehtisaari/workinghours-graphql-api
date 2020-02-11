const { ForbiddenError } = require('apollo-server')

const colorDefiner = number => {
  if (!number || number < 0 || number > 15) {
    return Math.floor(Math.random() * 15)
  } else {
    return number
  }
}

const taskResolvers = {
  Query: {
    allTasks: async (root, args, { dataSources }) => {
      return dataSources.taskDatabase.getTasks()
    }
  },
  Mutation: {
    createTask: async (_, args, { currentUser, dataSources }) => {
      if (!currentUser || !currentUser.admin) {
        throw new ForbiddenError('Creating task requires Admin privileges.')
      }

      const result = await dataSources.taskDatabase.createTask({
        projectId: args.projectId,
        name: args.name,
        description: args.description,
        color: colorDefiner(args.color)
      })
      return result
    },
    updateTask: async (_, args, { currentUser, dataSources }) => {
      if (!currentUser || !currentUser.admin) {
        throw new ForbiddenError('Updating a task requires Admin privileges.')
      }
      const result = await dataSources.taskDatabase.updateTask({
        id: args.id,
        name: args.name,
        description: args.description,
        color: colorDefiner(args.color)
      })
      return result
    }
  },
  Task: {
    project: async (root, _, { dataSources }) => {
      return dataSources.taskDatabase.getTaskProject(root.id)
    },
    hours: async (root, args, { dataSources }) => {
      const hourlogs = await dataSources.hourlogDatabase.getHourlogsByTaskRoot({
        root,
        dateTo: args.dateTo,
        dateFrom: args.dateFrom
      })
      const hours = hourlogs.reduce((accum, current) => {
        return (accum += current.hours)
      }, 0)
      return hours
    },
    cost: async (root, args, { dataSources }) => {
      const hourlogs = await dataSources.hourlogDatabase.getHourlogsByTaskRoot({
        root,
        dateTo: args.dateTo,
        dateFrom: args.dateFrom
      })

      const cost = hourlogs.reduce((accum, current) => {
        return (accum += current.hours * current.user.payByHour)
      }, 0)

      return Math.floor(cost * 100) / 100
    }
  }
}

module.exports = {
  taskResolvers
}
