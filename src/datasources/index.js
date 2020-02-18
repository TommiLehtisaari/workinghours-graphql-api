const mongoose = require('mongoose')
const logger = require('../utils/logger')

const UserMongo = require('./userMongo')
const ProjectMongo = require('./projectMongo')
const TaskMongo = require('./taskMongo')
const HourlogMongo = require('./hourlogMongo')

mongoose.set('useFindAndModify', false)
const env = process.env.NODE_ENV

const databaseDefiner = env => {
  const baseURL = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  switch (env) {
    case 'test':
      return baseURL + '/workinghours_testdb'
    case 'development':
      return baseURL + '/workinghours_developmentdb'
    default:
      return baseURL + '/workinghours_productiondb'
  }
}

const MONGODB_URI = databaseDefiner(env)

logger.log(`connecting to ${MONGODB_URI}`)

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(() => {
    logger.log('connected to MongoDB')
  })
  .catch(error => {
    logger.log('error connection to MongoDB:', error.message)
  })

module.exports = {
  UserDatabase: UserMongo,
  ProjectDatabase: ProjectMongo,
  TaskDatabase: TaskMongo,
  HourlogDatabase: HourlogMongo
}
