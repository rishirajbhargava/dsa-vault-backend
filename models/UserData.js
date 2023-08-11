

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    data: {
        type: Array,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});


module.exports = mongoose.model('UserData', UserSchema);