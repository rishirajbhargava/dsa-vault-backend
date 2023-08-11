const express = require('express');
const app = express();
const cors= require('cors');
const port = process.env.PORT || 9000;
const connectDb = require('./config/database');
const cookieParser =require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const User = require('./models/User');
require('dotenv').config();
const originalData = require('./data');
const bodyParser = require('body-parser');
const  passportConfig  =require('./config/Provider.js');
const  isAuthenticated  = require('./config/auth');
const UserData = require('./models/UserData');
const Feedback = require('./models/Feedback');

//----------------------------------------------------------END OF IMPORTS--------------------------------------------------------------//   


connectDb();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({origin: `${process.env.CLIENT_HOME_PAGE_URL}`,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
credentials: true}));

app.use(session({secret: 'secret', resave: true, saveUninitialized: true}))
app.use(cookieParser('secret'));

//pasport middleware

app.use(passport.initialize());
app.use(passport.session());
passportConfig();

//----------------------------------------------------------END OF MIDDLEWARES--------------------------------------------------------------//


//............................................................IMPORT _ ROUTES............................................................//

const adminRoutes = require('./routes/admin-routes');


//----------------------------------------------------------ROUTES--------------------------------------------------------------//

app.get('/', (req, res)=>{
    res.status(200).send('<h1>API is working... </h1>');
});

app.get('/logout', (req, res, next) => {
    req.session.destroy((err)=>{
        if(err) return next(err);
    });
    res.clearCookie('connect.sid');
    res.status(200).redirect(process.env.CLIENT_HOME_PAGE_URL);
});



app.get('/googlelogin', passport.authenticate('google', { scope: ['profile'] }));



app.get('/getuser',  (req, res) => {
    if(req.user){
        res.status(200).json({success: true, user: req.user});
    }else{
        res.status(200).json({success: false, user: null});
    }
    
})


app.get('/auth/google/callback', passport.authenticate('google',
 { 
    scope: ['profile'] ,
    successRedirect: process.env.CLIENT_PROFILE_PAGE_URL,
    failureRedirect: '/login/failed'
}));



app.get('/login/success', (req, res) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            message: 'user has successfully authenticated',
            user: req.user,
            cookies: req.cookies
        });
    }
});

app.get('/login/failed', (req, res) => {
    res.status(401).json({
        success: false,
        message: 'user failed to authenticate.'
    });
});




app.get('/profile',isAuthenticated, async (req, res) => {
    if (req.user) {
        const userData = await UserData.findOne({googleId: req.user.googleId});
        res.status(200).json({success: true, message: 'user has successfully authenticated', user: req.user, data: userData.data});
    }
    else{
        res.status(200).json({success: false, message: 'user failed to authenticate.'});
    }
});

app.put('/update-done', isAuthenticated, async (req, res) => {
    const {question} = req.body;
   
    if(req.user){
        const newUserData = await UserData.findOneAndUpdate(
                {googleId: req.user.googleId},
                {$set: {"data.$[obj].questions.$[obj2].Done": question.Done}},
                {arrayFilters: [ { "obj.topicName": question.Topic }, { "obj2.Problem": question.Problem } ] }
        );


        res.status(200).json({success: true , message: 'Data updated successfully'});
     } 
     else{
        res.status(200).json({success: false, error: 'User not found'});
    }
});


app.put('/update-bookmark',  isAuthenticated, async (req, res) => {
    const {question} = req.body;
   
    if(req.user){
        const newUserData = await UserData.findOneAndUpdate(
                {googleId: req.user.googleId},
                {$set: {"data.$[obj].questions.$[obj2].Bookmark": question.Bookmark}},
                {arrayFilters: [ { "obj.topicName": question.Topic }, { "obj2.Problem": question.Problem } ] }
        );

        res.status(200).json({success: true , message: 'Data updated successfully'});
     } 
     else{
        res.status(200).json({success: false, error: 'User not found'});
    }
});


app.put('/update-note',  isAuthenticated, async (req, res) => {
    const {question} = req.body;
   
    if(req.user){
        const newUserData = await UserData.findOneAndUpdate(
                {googleId: req.user.googleId},
                {$set: {"data.$[obj].questions.$[obj2].Notes": question.Notes}},
                {arrayFilters: [ { "obj.topicName": question.Topic }, { "obj2.Problem": question.Problem } ] }
        );

        res.status(200).json({success: true , message: 'Data updated successfully'});
     } 
     else{
        res.status(200).json({success: false, error: 'User not found'});
    }
});






app.put('/update',isAuthenticated,  async (req, res) => {
    const {topicName} = req.body;
    if(req.user){
    const newdata= await UserData.findOne({googleId: req.user.googleId});
    const data = newdata.data;
    const required = data.filter((obj) => obj.topicName === topicName);
    if(required.length > 0){
    const required2 = required[0].questions.filter((obj) => obj.Done === true);
    const required3 = required2.length;

    if(required3>0){
            const newUserData = await UserData.findOneAndUpdate(
                {googleId: req.user.googleId},
                {$set: {"data.$[obj].started": true}},
                {arrayFilters: [ { "obj.topicName": topicName } ] }
            );
        }else{
            const newUserData = await UserData.findOneAndUpdate(
                {googleId: req.user.googleId},
                {$set: {"data.$[obj].started": false}},
                {arrayFilters: [ { "obj.topicName": topicName } ] }
            );
        }
    }
        
    }else{
        res.status(200).json({success: false, error: 'User not found'});
    }
}); 

app.get('/resetprogress', isAuthenticated, async (req, res) => {
    if(req.user){
        const newUserData = await UserData.findOneAndUpdate(
            {googleId: req.user.googleId},
            {$set: {"data": originalData}},
        );
        res.status(200).json({success: true , message: 'Data updated successfully'});
    }else{
        res.status(200).json({success: false, message: 'User not logged In'});
    }

});

app.delete('/deleteaccount',isAuthenticated, async (req, res) => {
    if(req.user){
        const newUserData = await UserData.findOneAndDelete({googleId: req.user.googleId});
        const user = await User.findOneAndDelete({googleId: req.user.googleId});
        console.log("User Data and User Deleted" + user) ;          
        res.status(200).json({success: true , message: 'Data deleted successfully'});
    }else{
        res.status(200).json({success: false, error: 'User not logged In'});
    }
});




app.get('/userdata',isAuthenticated, async (req, res) => {

    if(req.user){
        const userdata = await UserData.findOne({googleId: req.user.googleId});

        if(userdata){
            res.status(200).json({success: true , data: userdata.data});
        }else{
            res.status(200).json({success: false, error: 'User not found'});
        }
    }else{
        res.status(200).json({success: false, error: 'User not found'});
    }

});
app.get('/userdata/:position',isAuthenticated, async (req, res) => {

    if(req.user){
        const userdata = await UserData.findOne({googleId: req.user.googleId});
        const data = userdata.data[req.params.position];
        if(userdata){
            res.status(200).json({success: true , data: data});
        }else{
            res.status(200).json({success: false, error: 'User not found'});
        }
    }else{
        res.status(200).json({success: false, error: 'User not logged In'});
    }

});

app.get('/userdata/:position/:index',isAuthenticated, async (req, res) => {

    const {position, index} = req.params;
   
    if(req.user){
        const userdata = await UserData.findOne({googleId: req.user.googleId});
        const data = userdata.data[position].questions[index];
        if(userdata){
            res.status(200).json({success: true , data: data});
        }else{
            res.status(200).json({success: false, error: 'User not found'});
        }
    }else{
        res.status(200).json({success: false, error: 'User not logged In'});
    }
});


app.post('/feedbacks',isAuthenticated, async (req, res) => {
        const {feedback} = req.body;
        if(req.user){
            const newUserData = await Feedback.create({googleId: req.user.googleId, name:req.user.displayName,  feedback: feedback});
            console.log('feedback created')
            res.status(200).json({success: true , message: 'Data updated successfully'});
        }else{
            res.status(200).json({success: false, message: 'User not logged In'});
        }

});

app.use('/admin', isAuthenticated , adminRoutes);









app.post('/theme',isAuthenticated, async (req, res) => {
    const { theme } = req.body;
    console.log(req.body.user);
})


//----------------------------------------------------------END OF ROUTES--------------------------------------------------------------//


const ip = require("ip");
console.dir ( ip.address() );


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})









