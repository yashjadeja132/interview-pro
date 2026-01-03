const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    image: { type: String},
    role: { type: [String], enum: ['Hr', 'Admin', 'Student'], default:['Student'] }
});

module.exports = mongoose.model('User', userSchema);
