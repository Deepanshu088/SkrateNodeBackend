const mongoose = require('mongoose')

const user = mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: global.ROLES }
})

module.exports = mongoose.model('User', user);