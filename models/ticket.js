const mongoose = require('mongoose')

const ticket = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: "open", enum: ['open', 'closed'] },
    priority: { type: String, default: "low", enum: global.PRIORITY },
    assignedTo: { type: String, default: null },
},{
    timestamps: {
        createdAt: true,
        updatedAt: false
    }
})

module.exports = mongoose.model('Ticket', ticket);