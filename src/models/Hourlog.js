const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  hours: {
    type: Number,
    required: true
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true }
})

module.exports = mongoose.model('Hourlog', schema)
