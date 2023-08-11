const mongoose = require('mongoose');

const UserInfoSchema = new mongoose.Schema({
    googleId:  String,
    Name: String,
    Bio:  String,
    Email: String,
    Github: String,
    Linkedin: String,
    Twitter: String,
    College: String,
    Skills: {
        type: Array,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('UserInfo', UserInfoSchema);
