const { DataSource } = require('apollo-datasource')
const { UserInputError } = require('apollo-server')
const { Task, Project } = require('../models')

class TaskMongo extends DataSource {
  constructor() {
    super()
  }

  async getTasks() {
    return Task.find({})
  }

  async createTask({ projectId, name, description, color }) {
    const project = await Project.findById(projectId)
    if (!project) {
      throw new UserInputError(`Project with given id (${projectId} not found)`)
    }

    const task = new Task({
      name,
      description,
      project: project._id,
      color
    })

    try {
      await task.save()
      project.tasks = project.tasks.concat(task._id)
      await project.save()
      return task
    } catch (error) {
      throw new UserInputError(error.message, {
        invalidArgs: { projectId, name, description }
      })
    }
  }

  async updateTask({ id, name, description, color }) {
    const task = await Task.findById(id)
    if (!task) {
      throw new UserInputError(`Task with given id (${id} not found)`)
    }
    task.name = name || task.name
    task.description = description || task.description
    task.color = color || task.color
    task.save()
    await task.populate('project')
    return task
  }

  async getTaskProject(id) {
    const task = await Task.findById(id).populate('project')
    return task.project
  }
}

module.exports = TaskMongo
