const { createTestClient } = require('apollo-server-testing')
const { gql } = require('apollo-server')
const mongoose = require('mongoose')
const { Task, Project } = require('../src/models')
const { constructTestServer } = require('./utils/utils')
const { testProjects, initProjects } = require('./utils/testdata')
const { CREATE_PROJECT, ALL_PROJECTS } = require('./utils/graphqlQueries')

const server = constructTestServer({
  context: () => ({ currentUser: { username: 'testuser', admin: true } })
})

const UPDATE_PROJECT = gql`
  mutation updateProject($name: String!, $id: String!) {
    updateProject(name: $name, id: $id) {
      name
      id
    }
  }
`

beforeEach(async () => {
  await Task.deleteMany({})
  await Project.deleteMany({})
})

describe('Mutations', () => {
  it('Create new Project.', async () => {
    const { mutate } = await createTestClient(server)
    const result = await mutate({
      mutation: CREATE_PROJECT,
      variables: { name: testProjects[0].name }
    })
    const project = result.data.createProject
    expect(project.name).toBe(testProjects[0].name)
    expect(project).toHaveProperty('id')
  })

  it('Update a Project.', async () => {
    const { mutate } = await createTestClient(server)
    const result = await mutate({
      mutation: CREATE_PROJECT,
      variables: { name: testProjects[0].name }
    })
    const project = result.data.createProject
    const updated = await mutate({
      mutation: UPDATE_PROJECT,
      variables: { name: 'new name', id: project.id }
    })
    expect(updated.data.updateProject.name).toBe('new name')
  })
})

describe('Queries', () => {
  it('AllProjects query works and Tasks property is included.', async () => {
    await initProjects()
    const { query } = await createTestClient(server)
    const result = await query({ query: ALL_PROJECTS })
    result.data.allProjects.forEach(project => {
      expect(project).toHaveProperty('name')
      expect(project).toHaveProperty('id')
      expect(project).toHaveProperty('tasks')
      project.tasks.forEach(task => {
        expect(task).toHaveProperty('name')
        expect(task).toHaveProperty('id')
      })
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})
