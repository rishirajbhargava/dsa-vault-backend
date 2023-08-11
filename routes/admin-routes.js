
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../config/auth.js');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

router.get('/', (req, res) => {
    res.send('admin page');
});

router.get('/feedbacks', isAuthenticated, async (req, res) => {
    if(req.user){
        const feedbacks = await Feedback.find({});
        res.status(200).json({success: true , feedbacks: feedbacks});
    }else{
        res.status(200).json({success: false, message: 'User not logged In'});
    }
});

router.get('/users', isAuthenticated, async (req, res) => {
    if(req.user){
        const users = await User.find({});
        res.status(200).json({success: true , users: users});
    }else{
        res.status(200).json({success: false, message: 'User not logged In'});
    }

});


module.exports = router;