const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    city: { type: String, required: true },
    deliveryType: { type: String, required: true },
    trustScore: { type: Number, default: 50 },
    deviceId: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
