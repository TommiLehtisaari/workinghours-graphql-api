const { DataSource } = require('apollo-datasource')
const { UserInputError } = require('apollo-server')
const { Project } = require('../models')

class ProjectMongo extends DataSource {
  constructor() {
    super()
  }

  async getProjects() {
    return Project.find({})
  }

  async getProjectById(id) {
    return Project.findById(id)
  }

  async createProject({ name }) {
    const project = new Project({ name })
    try {
      await project.save()
      return project
    } catch (error) {
      throw new UserInputError(error.message, {
        invalidArgs: name
      })
    }
  }

  async updateProject({ id, name }) {
    const project = await Project.findById(id)
    if (!project) {
      throw new UserInputError(`Project with id '${id}' not found`)
    }
    project.name = name || project.name
    try {
      await project.save()
      await project.populate('tasks')
      return project
    } catch (error) {
      throw new UserInputError(error.message, {
        invalidArgs: name
      })
    }
  }

  async getProjectTasks(id) {
    const project = await Project.findById(id).populate('tasks')
    return project.tasks
  }
}

module.exports = ProjectMongo
