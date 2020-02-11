const log = message => {
  const env = process.env.NODE_ENV
  if (env !== 'test') {
    console.log(message)
  }
}

module.exports = { log }
