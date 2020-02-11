const { createTestClient } = require('apollo-server-testing')
const { gql } = require('apollo-server')
const mongoose = require('mongoose')
const { User, Hourlog } = require('../src/models')
const { constructTestServer } = require('./utils/utils')
const { initProjects } = require('./utils/testdata')
const { ALL_PROJECTS } = require('./utils/graphqlQueries')

let query
let mutate

beforeAll(async () => {
  const testUser = new User({
    name: 'hourlogtester',
    username: 'hourlogtesting',
    password: 'a good hash',
    admin: true
  })

  const server = await constructTestServer({
    context: () => ({ currentUser: { ...testUser, id: testUser._id } })
  })

  await User.deleteMany({})
  await Hourlog.deleteMany({})
  await testUser.save()

  const { query: q, mutate: m } = createTestClient(server)
  query = q
  mutate = m
  await initProjects()
})

const CREATE_HOURLOG = gql`
  mutation createHourlog($taskId: String!, $hours: Float!, $date: String!) {
    createHourlog(taskId: $taskId, hours: $hours, date: $date) {
      id
      hours
      date
      task {
        name
        id
        project {
          id
          name
        }
      }
    }
  }
`

const UPDATE_HOURLOG = gql`
  mutation updateHourlog($id: String!, $hours: Float, $date: String) {
    updateHourlog(id: $id, hours: $hours, date: $date) {
      id
      hours
      date
      task {
        name
        id
        project {
          id
          name
        }
      }
    }
  }
`

const DELETE_HOURLOG = gql`
  mutation deleteHourlog($id: String!) {
    deleteHourlog(id: $id)
  }
`

describe('Mutations', () => {
  it('Create new Hourlog.', async () => {
    const result = await query({ query: ALL_PROJECTS })
    const taskId = result.data.allProjects[0].tasks[0].id
    const hourlog = await mutate({
      mutation: CREATE_HOURLOG,
      variables: { hours: 5.5, date: '2019-07-06', taskId }
    })
    const actual = hourlog.data.createHourlog
    expect(actual).toHaveProperty('id')
    expect(actual.hours).toBe(5.5)
    expect(actual.date).toBe('2019-07-06')
    expect(actual).toHaveProperty('task')
    expect(actual.task).toHaveProperty('project')
    expect(actual.task).toHaveProperty('id')
    expect(actual.task).toHaveProperty('name')
    expect(actual.task.project).toHaveProperty('name')
    expect(actual.task.project).toHaveProperty('id')
  })

  it('Edit hourlog (only hour).', async () => {
    const result = await query({ query: ALL_PROJECTS })
    const taskId = result.data.allProjects[0].tasks[0].id
    const hourlog = await mutate({
      mutation: CREATE_HOURLOG,
      variables: { hours: 7.5, date: '2019-07-07', taskId }
    })
    const hourlogId = hourlog.data.createHourlog.id

    const edited = await mutate({
      mutation: UPDATE_HOURLOG,
      variables: { id: hourlogId, hours: 2 }
    })
    const actual = edited.data.updateHourlog
    expect(actual).toHaveProperty('id')
    expect(actual.hours).toBe(2)
    expect(actual.date).toBe('2019-07-07')
    expect(actual).toHaveProperty('task')
    expect(actual.task).toHaveProperty('project')
    expect(actual.task).toHaveProperty('id')
    expect(actual.task).toHaveProperty('name')
    expect(actual.task.project).toHaveProperty('name')
    expect(actual.task.project).toHaveProperty('id')
  })

  it('Edit hourlog (only date).', async () => {
    const result = await query({ query: ALL_PROJECTS })
    const taskId = result.data.allProjects[0].tasks[0].id
    const hourlog = await mutate({
      mutation: CREATE_HOURLOG,
      variables: { hours: 7.5, date: '2019-07-07', taskId }
    })
    const hourlogId = hourlog.data.createHourlog.id

    const edited = await mutate({
      mutation: UPDATE_HOURLOG,
      variables: { id: hourlogId, date: '2019-04-05' }
    })
    const actual = edited.data.updateHourlog
    expect(actual.hours).toBe(7.5)
    expect(actual.date).toBe('2019-04-05')
  })

  it('Delete Hourlog', async () => {
    const result = await query({ query: ALL_PROJECTS })
    const taskId = result.data.allProjects[0].tasks[0].id
    const hourlog = await mutate({
      mutation: CREATE_HOURLOG,
      variables: { hours: 10, date: '2019-07-07', taskId }
    })
    const hourlogId = hourlog.data.createHourlog.id

    const deleted = await mutate({
      mutation: DELETE_HOURLOG,
      variables: { id: hourlogId }
    })

    expect(deleted.data.deleteHourlog).toBe('ok')
  })
})

// describe('Mutations', () => {
//   it('Get all Hourlogs.', async () => {

//   })
// })

afterAll(() => {
  mongoose.connection.close()
})
