const { DataSource } = require('apollo-datasource')
const { UserInputError, AuthenticationError } = require('apollo-server')
const { Task, Hourlog, User } = require('../models')

class HourlogMongo extends DataSource {
  constructor() {
    super()
  }

  async getAllHourlogs({ dateFrom, dateTo }) {
    const query = {}
    if (dateFrom) {
      query.date = { $gte: dateFrom, $lte: dateTo }
    }
    return Hourlog.find(query)
  }

  async getMyAllHourlogs({ dateFrom, dateTo, currentUser }) {
    const query = { user: currentUser.id }
    if (dateFrom && dateTo) {
      query.date = { $gte: dateFrom, $lte: dateTo }
    }
    return Hourlog.find(query)
  }

  async getHourlogsByTaskRoot({ root, dateFrom, dateTo }) {
    const query = { task: root.id }
    if (dateFrom && dateTo) {
      query.date = { $gte: dateFrom, $lte: dateTo }
    }
    return Hourlog.find(query).populate('user')
  }

  async getHourlogsByProjectRoot({ root, dateFrom, dateTo }) {
    const query = { task: { $in: root.tasks } }
    if (dateFrom && dateTo) {
      query.date = { $gte: dateFrom, $lte: dateTo }
    }
    return Hourlog.find(query).populate('user')
  }

  async createHourlog({ taskId, hours, date, currentUser }) {
    const task = await Task.findById(taskId)
    if (!task || !hours || !date) {
      throw UserInputError(`Invalid arguments .`, {
        invalidArgs: { taskId, hours, date }
      })
    }
    const hourlog = new Hourlog({
      user: currentUser.id,
      task: task._id,
      hours,
      date: new Date(date)
    })
    await hourlog.save()
    const user = await User.findById(currentUser.id)
    user.hourlogs = user.hourlogs.concat(hourlog._id.toString())
    await user.save()
    return hourlog
  }

  async updateHourlog({ id, hours, date, currentUser }) {
    const user = await User.findById(currentUser.id)
    const hourlog = await Hourlog.findById(id).populate('user')

    await hourlog.populate('user').populate('project')

    if (!hourlog) {
      throw UserInputError(`Hourlog with given id '${id}' not found`)
    } else if (hourlog.user.id.toString() !== user._id.toString()) {
      throw new AuthenticationError(
        `Hourlog can be updatet only by the author of the hourlog`
      )
    }

    hourlog.date = date || hourlog.date
    hourlog.hours = hours || hourlog.hours
    await hourlog.save()
    return hourlog
  }

  async deleteHourlog({ id, currentUser }) {
    const user = await User.findById(currentUser.id)
    const hourlog = await Hourlog.findById(id).populate('user')

    if (!hourlog) {
      throw new UserInputError(`Hourlog with given id '${id}' not found`)
    }

    if (hourlog.user.id.toString() !== user._id.toString()) {
      throw new AuthenticationError(
        `Hourlog can be deleted only by the author of the hourlog`
      )
    }

    await hourlog.remove()
    return 'ok'
  }

  async getHourlogTask(id) {
    const hourlog = await Hourlog.findById(id).populate('task')
    return hourlog.task
  }

  async getHourlogUser(id) {
    const hourlog = await Hourlog.findById(id).populate('user')
    return hourlog.user
  }
}

module.exports = HourlogMongo
