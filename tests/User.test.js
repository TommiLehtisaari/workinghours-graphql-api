const { createTestClient } = require('apollo-server-testing')
const { gql } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { User } = require('../src/models')
const { constructTestServer } = require('./utils/utils')

const CREATE_USER = gql`
  mutation createUser($username: String!, $name: String, $password: String!) {
    createUser(username: $username, name: $name, password: $password) {
      value
    }
  }
`
const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

const ALL_USERS = gql`
  query allUsers {
    allUsers {
      username
      name
      id
    }
  }
`

const UPDATE_USER_TO_ADMIN = gql`
  mutation updateUserById($id: String!, $admin: Boolean) {
    updateUserById(id: $id, admin: $admin) {
      name
      id
      username
      admin
    }
  }
`

const testUsers = [
  { username: 'testuser', name: 'Firstname Lastname', password: 'salainen' }
]

describe('Mutations', () => {
  it('User created.', async () => {
    await User.deleteMany({})
    const server = constructTestServer()
    const { mutate } = await createTestClient(server)
    const res = await mutate({
      mutation: CREATE_USER,
      variables: testUsers[0]
    })
    const token = res.data.createUser.value
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    expect(decodedToken.name).toEqual(testUsers[0].name)
    expect(decodedToken.username).toEqual(testUsers[0].username)
  })

  it('Throws error if username is not unique.', async () => {
    const server = constructTestServer()
    const { mutate } = await createTestClient(server)
    const res = await mutate({
      mutation: CREATE_USER,
      variables: testUsers[0]
    })
    expect(res.errors[0].message).toMatch(/unique/)
  })

  it('Login', async () => {
    const server = constructTestServer()
    const { mutate } = await createTestClient(server)
    const res = await mutate({
      mutation: LOGIN,
      variables: testUsers[0]
    })
    const token = res.data.login.value
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    expect(decodedToken.name).toEqual(testUsers[0].name)
    expect(decodedToken.admin).toEqual(false)
    expect(decodedToken.username).toEqual(testUsers[0].username)
  })

  it('Superuser creation', async () => {
    const server = constructTestServer()
    const { mutate } = await createTestClient(server)
    const res = await mutate({
      mutation: CREATE_USER,
      variables: { username: 'superuser', password: 'keLo6g12_lM4c' }
    })
    const token = res.data.createUser.value
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    expect(decodedToken.username).toEqual('superuser')
    expect(decodedToken.admin).toEqual(true)
  })

  it('User can be updated to admin by another admin.', async () => {
    const server = constructTestServer({
      context: () => ({ currentUser: { ...testUsers[0], admin: true } })
    })
    const { mutate } = await createTestClient(server)

    const res = await mutate({
      mutation: CREATE_USER,
      variables: {
        name: 'Made up Name',
        username: 'madeupuser',
        password: 'keLo6g12_lM4c'
      }
    })
    const token = res.data.createUser.value
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

    expect(decodedToken.admin).toEqual(false)

    const updatedUser = await mutate({
      mutation: UPDATE_USER_TO_ADMIN,
      variables: { id: decodedToken.id, admin: true }
    })

    const actuall = updatedUser.data.updateUserById
    expect(actuall.admin).toEqual(true)
  })
})

describe('Queries', () => {
  it('Get allUsers', async () => {
    const server = constructTestServer({
      context: () => ({ currentUser: { ...testUsers[0], admin: true } })
    })
    const { query } = await createTestClient(server)
    const res = await query({ query: ALL_USERS })
    expect(res.data.allUsers[0]).toHaveProperty('name')
    expect(res.data.allUsers[0]).toHaveProperty('username')
    expect(res.data.allUsers[0]).toHaveProperty('id')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
