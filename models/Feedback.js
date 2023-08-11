
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    googleId:  String,
    name: String,
    feedback: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);