const jwt = require('jsonwebtoken');
const User = require('../models/user');

//Route protecting Middleware
const requireAuth = (req,res, next) => {
    const token = req.cookies.jwt;
    //check if the json web token is present and verified
    if(token){
        jwt.verify(token, "jwtSecret", (err, decodedToken) => {
            if(err){
                console.log(err.message);
                res.rerdirect('/login');
            } else {
                next();
            }
        });
    } else {
        res.redirect('/login');
    }
};

// Checking user in
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, "jwtSecret", async (err, decodedToken) => {
            if(err){
                res.locals.user = null;
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};

module.exports = {requireAuth, checkUser};