const { createTestClient } = require('apollo-server-testing')
const { Task, Project } = require('../../src/models')
const { constructTestServer } = require('./utils')
const { CREATE_PROJECT, CREATE_TASK } = require('./graphqlQueries')

const testProjects = [
  {
    name: 'Node backend',
    tasks: [
      { name: 'refactoring', description: 'all refactoring' },
      { name: 'integration testing' }
    ]
  },
  {
    name: 'React frontend',
    tasks: [
      { name: 'composing components', description: 'new component creations.' },
      {
        name: 'graphic desing',
        description: 'deseging UI either planning or excecuting with CSS'
      }
    ]
  }
]

const initProjects = async () => {
  await Task.deleteMany({})
  await Project.deleteMany({})
  const server = constructTestServer({
    context: () => ({ currentUser: { username: 'testuser', admin: true } })
  })
  const { mutate } = createTestClient(server)

  await Promise.all(
    testProjects.map(async p => {
      const project = await mutate({
        mutation: CREATE_PROJECT,
        variables: { name: p.name }
      })

      await Promise.all(
        p.tasks.map(async t => {
          await mutate({
            mutation: CREATE_TASK,
            variables: {
              name: t.name,
              projectId: project.data.createProject.id,
              description: t.description
            }
          })
        })
      )
    })
  )
}

module.exports = { testProjects, initProjects }
