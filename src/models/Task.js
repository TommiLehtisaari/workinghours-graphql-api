const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  color: {
    type: Number,
    required: true
  },
  // hourlogs: [{ type: Schema.Types.ObjectId, ref: 'Hourlog' }],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  }
})

module.exports = mongoose.model('Task', schema)
