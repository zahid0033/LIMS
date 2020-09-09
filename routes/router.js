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

router.get("/", (req, res) => {
    res.render("pages/index");
});

//Auth Routes
router.get("/signup", (req, res) => {
    res.render("pages/signup");
});
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
router.get("/login", (req, res) => {
    res.render("pages/login");
});
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
router.get('/logout', async (req, res) => {
    res.cookie("jwt", "", { maxAge:1 });
    res.redirect("/");
});
//Auth Routes end

router.get("/dashboard", (req, res) => {
    res.render("pages/dashboard");
});

// samples
router.get("/samples", (req, res) => res.render("pages/samples"));
router.get("/samplesTable", (req, res) => res.render("pages/samplesTable"));
// samples end

// record 
router.get("/record", (req, res) => res.render("pages/record/record"));
router.get("/recordTable", (req, res) => res.render("pages/record/recordTable"));

// certification
router.get('/certification', (req, res) => res.render("pages/certification"));
router.get('/certificationTable', (req, res) => res.render("pages/certificationTable"));
// certification end

//inventory (reagent)
router.get('/reagent', (req,res) => res.render("pages/Inventory/Reagent/reagent") );
router.get('/addReagent', (req,res) => res.render("pages/Inventory/Reagent/addReagent") );
//inventory end

//inventory (apparatus)
router.get('/apparatus', (req,res) => res.render("pages/Inventory/Apparatus/apparatus") );
router.get('/addApparatus', (req,res) => res.render("pages/Inventory/Apparatus/addApparatus") );
//inventory end

//inventory (equipments)
router.get('/equipments', (req,res) => res.render("pages/Inventory/Equipments/equipment") );
router.get('/addEquipments', (req,res) => res.render("pages/Inventory/Equipments/addEquipments") );
//inventory end

// project tracking
router.get('/runningProject', (req,res) => res.render("pages/project/runningProjects"));
router.get('/projectUpdats', (req,res) => res.render("pages/project/projectUpdates"));
// project tracking end

//inventory notifications (reagent)
router.get('/reagentNotification', (req,res) => res.render("pages/notification/reagentNotification"));
// reagent end

//inventory notifications (apparatus)
router.get('/apparatusNotification', (req,res) => res.render("pages/notification/apparatusNotification"));
// apparatus end

//inventory notifications (equipments)
router.get('/equipmentNotification', (req,res) => res.render("pages/notification/equipmentNotification"));
//equipments end


module.exports = router;