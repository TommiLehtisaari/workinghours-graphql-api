const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
  name: {
    type: String,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 5
  },
  admin: {
    type: Boolean,
    required: true
  },
  payByHour: {
    type: Number
  },
  hourlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hourlog' }]
}).plugin(uniqueValidator)

module.exports = mongoose.model('User', schema)
