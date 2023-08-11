
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    displayName: String,
    photo: String,
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'

    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    theme:{
        type: Boolean,
        default: false,
    },
});


const User = mongoose.model('User', userSchema);

module.exports = User;