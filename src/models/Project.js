const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const schema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
}).plugin(uniqueValidator)

module.exports = mongoose.model('Project', schema)
