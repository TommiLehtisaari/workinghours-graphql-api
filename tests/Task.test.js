const { createTestClient } = require('apollo-server-testing')
const mongoose = require('mongoose')
const { Task, Project } = require('../src/models')
const { constructTestServer } = require('./utils/utils')
const { testProjects } = require('./utils/testdata')
const { CREATE_PROJECT, CREATE_TASK } = require('./utils/graphqlQueries')

const server = constructTestServer({
  context: () => ({ currentUser: { username: 'testuser', admin: true } })
})

describe('Mutations', () => {
  beforeEach(async () => {
    await Task.deleteMany({})
    await Project.deleteMany({})
  })

  it('Create new Task.', async () => {
    const { mutate } = await createTestClient(server)
    const result = await mutate({
      mutation: CREATE_PROJECT,
      variables: { name: testProjects[0].name }
    })
    const project = result.data.createProject
    const testTask = testProjects[0].tasks[0]
    const task = await mutate({
      mutation: CREATE_TASK,
      variables: {
        name: testTask.name,
        projectId: project.id,
        description: testTask.description
      }
    })
    const actual = task.data.createTask
    expect(actual).toHaveProperty('id')
    expect(actual).toHaveProperty('name')
    expect(actual).toHaveProperty('project')
    expect(actual.project).toHaveProperty('name')
    expect(actual.project).toHaveProperty('id')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
