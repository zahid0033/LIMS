const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const {checkUser} = require("./middleware/authMiddleware");

//Reference of express module
const app = express();

const url = "mongodb://localhost:27017/lims"; 
// If we want to use mongo atlas
//const dbURI = 'mongodb+srv://el06:test1234@cluster0.oho65.mongodb.net/node-auth';
const port = process.env.PORT || 8000;

//Middleware
app.use(express.json());
app.use(cookieParser());

//Database connection
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true });
const db = mongoose.connection;
db.on("open", () => console.log("DB Connection Successfull"));

//view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Checking the user
app.get("*", checkUser);

//Route handler
const indexRouter = require('./routes/router');
app.use("/", indexRouter);

//Setting up the public folder
app.use(express.static('public'));

//Server Listener
app.listen(port, () => console.log(`Server is running at port: ${port}`));