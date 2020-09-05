const express = require("express");
const router = express.Router();
//const router = require("express").Router();
const jwt = require("jsonwebtoken");
//Importing the models
const Example = require("../models/schema");
const User = require("../models/user");
//Importing the middleware
const {requireAuth} = require("../middleware/authMiddleware"); // Have to use this "requireAuth" middleware in any route we want to protect.

//handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = {email:"", password:""};
    //incorrect email & password in login form
    if(err.message === "Incorrect Email"){
        errors.email = "That email is not registered";
    } 
    if(err.message === "Incorrect Password"){
        errors.password = "That password is not correct";
    }
    //duplicate
    if (err.code === 11000) {
        errors.email = "That email already exists";
        return errors;
    }
    // validation errors
    if (err.message.includes("user validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
        errors[properties.path] = [properties.message];
    });
  }
  return errors;
};

//create a json web token
const maxAge = 3*24*60*60;
const createToken = (id) => {
  return jwt.sign({id}, "jwtSecret", {
    expiresIn: maxAge
  });
};


//Route and Controller Actions

//@route  -  GET /
//@desc   -  a route to home page.
//@access -  public
router.get("/", (req, res) => {
    res.render("pages/index");
});

//@route  -  GET /
//@desc   -  a route to dashboard page.
//@access -  private
router.get("/dashboard", (req, res) => {
    res.render("pages/dashboard");
});

//Auth Routes

//@route  -  GET /signup
//@desc   -  a route to the signup page.
//@access -  public
router.get("/signup", (req, res) => {
    res.render("pages/signup");
});

//@route  -  GET /login
//@desc   -  a route to the login page.
//@access -  public
router.get("/login", (req, res) => {
    res.render("pages/login");
});

//@route  -  POST /signup
//@desc   -  getting value from signup page.
//@access -  public
router.post("/signup", async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.create({email, password});
        const token = createToken(user._id);
        res.cookie("jwt", token, {httpOnly: true, maxAge:maxAge*1000});
        res.status(201).json({user: user._id});
    } catch (err) {
        const error = handleErrors(err);
        res.status(400).json({ error });
    }
});

//@route  -  POST /login
//@desc   -  getting value from login page.
//@access -  public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, {httpOnly: true, maxAge:maxAge*1000});
        res.status(201).json({user: user._id});
    } catch (err) {
        const error = handleErrors(err);
        res.status(400).json({error});
    }
});

//@route  -  GET /logout
//@desc   -  logout from current user.
//@access -  public
router.get('/logout', async (req, res) => {
    res.cookie("jwt", "", { maxAge:1 });
    res.redirect("/");
});

module.exports = router;