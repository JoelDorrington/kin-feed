var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStategy = require("passport-local"),
    User = require("./models/user");

// Connect Routes
var noteRoutes = require("./routes/notes"),
    publicRoutes = require("./routes/public"),
    indexRoutes = require("./routes/index");


// Configure Mongoose and App
mongoose.connect("mongodb://localhost/family-website", {useMongoClient: true});
mongoose.Promise = global.Promise;
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// Configure Passport
app.use(require("express-session")({
  secret: "TbFhMmFw2017",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global Resources
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});

// Routing
app.use("/notes", noteRoutes);
app.use("/public", publicRoutes);
app.use(indexRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
  console.log("The family site is running.");
});