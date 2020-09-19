//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

console.log(process.env.SECRET);
//connect to mongodb using mongoose
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true});

//define Schema
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

//string for entryption is to be placed before defining mongoose collection from schema, which is modified by plugin
// const secret = "ThisisanyStringthatyoufeellike";
//taking it from .env file
const secret=process.env.SECRET;

userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

//define mongoose model(coll)
const user_model = mongoose.model("User",userSchema);

//codes
app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res){
  const newUser = new user_model({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if (!err) {
      res.render("secrets");
    } else {
      console.log(err);
    }
  });
});

app.post("/login", function(req, res) {
    const userid = req.body.username;
    const pwd = req.body.password;
    user_model.findOne({email: userid}, function(err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          if (foundUser.password === pwd ) {
            res.render("secrets");
          } else {
            console.log("invalid Password");
          }
        } else {
          console.log("User not found");
        }
      }
    });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
