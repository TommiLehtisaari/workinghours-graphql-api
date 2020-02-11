const { AuthenticationError } = require('apollo-server')

const hourlogResolvers = {
  Query: {
    allHourlogs: async (_, args, { dataSources }) => {
      const { dateFrom, dateTo } = args
      return dataSources.hourlogDatabase.getAllHourlogs({ dateFrom, dateTo })
    },
    myHourlogs: async (_, args, { dataSources, currentUser }) => {
      const { dateFrom, dateTo } = args
      return dataSources.hourlogDatabase.getMyAllHourlogs({
        dateFrom,
        dateTo,
        currentUser
      })
    }
  },
  Mutation: {
    createHourlog: async (_, args, { currentUser, dataSources }) => {
      if (!currentUser) throw new AuthenticationError('Token not provided')
      const result = dataSources.hourlogDatabase.createHourlog({
        taskId: args.taskId,
        hours: args.hours,
        date: args.date,
        currentUser
      })
      return result
    },
    updateHourlog: async (_, args, { currentUser, dataSources }) => {
      if (!currentUser) throw new AuthenticationError('Token not provided')
      const result = await dataSources.hourlogDatabase.updateHourlog({
        id: args.id,
        hours: args.hours,
        date: args.date,
        currentUser
      })
      return result
    },
    deleteHourlog: async (_, args, { currentUser, dataSources }) => {
      if (!currentUser) throw new AuthenticationError('Token not provided')
      const result = await dataSources.hourlogDatabase.deleteHourlog({
        id: args.id,
        currentUser
      })
      return result
    }
  },
  Hourlog: {
    task: async (root, _, { dataSources }) => {
      const result = await dataSources.hourlogDatabase.getHourlogTask(root.id)
      return result
    },
    user: async (root, args, { currentUser, dataSources }) => {
      if (!currentUser || !currentUser.admin) return null
      const result = await dataSources.hourlogDatabase.getHourlogUser(root.id)
      return result
    }
  }
}

module.exports = { hourlogResolvers }
