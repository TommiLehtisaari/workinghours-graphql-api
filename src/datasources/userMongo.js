const { DataSource } = require('apollo-datasource')
const { AuthenticationError, UserInputError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const _ = require('lodash')
const { User } = require('../models')

class UserMongo extends DataSource {
  constructor() {
    super()
  }

  createToken(user) {
    return jwt.sign(
      _.pick(user, ['username', 'name', 'admin', 'id']),
      process.env.JWT_SECRET
    )
  }

  async getAllUsers() {
    return await User.find({})
  }

  async getUserById(id) {
    return await User.findById(id)
  }

  async createUser({ username, name, password }) {
    const saltRounds = 10
    const hashPassword = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      name,
      password: hashPassword,
      admin: false
    })

    try {
      await user.save()
      return this.createToken(user)
    } catch (error) {
      throw new UserInputError(error.message, {
        invalidArgs: { username, password, name }
      })
    }
  }

  async createSuperuser({ username, password }) {
    const db_user = await User.findOne({ username })
    if (db_user) {
      throw new UserInputError('Superuser alrady exists in the database.')
    }

    const saltRounds = 10
    const hashPassword = await bcrypt.hash(password, saltRounds)

    const user = new User({
      username,
      name: 'Superuser',
      password: hashPassword,
      admin: true
    })

    try {
      await user.save()
      return this.createToken(user)
    } catch (error) {
      throw new UserInputError(error.message, {
        invalidArgs: { username, password, name }
      })
    }
  }

  async updateCurrentUser({ username, name, password, id }) {
    const user = await User.findById(id)
    if (!user) throw new UserInputError(`User not found with id: '${id}'`)

    if (password) {
      const saltRounds = 10
      user.password = await bcrypt.hash(password, saltRounds)
    }

    user.username = username || user.username
    user.name = name || user.name
    await user.save()
    return this.createToken(user)
  }

  async updateUser({ username, name, id, admin, payByHour }) {
    const user = await User.findById(id)
    if (!user) throw new UserInputError(`User not found with id: '${id}'`)

    const define_admin = () => {
      if (admin === false) return false
      else if (admin === true) return true
      return user.admin
    }

    user.username = username || user.username
    user.name = name || user.name
    user.admin = define_admin()
    user.payByHour = payByHour || user.payByHour
    await user.save()
    return user
  }

  async login({ username, password }) {
    const user = await User.findOne({ username })
    if (!user) {
      throw new AuthenticationError(`User with name of '${username}' not found`)
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) throw new AuthenticationError(`Invalid password`)

    return this.createToken(user)
  }
}

module.exports = UserMongo
