var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User = require("./models/user"),
    seedDB = require("./seeds");

mongoose.connect("mongodb://localhost/family-website", {useMongoClient: true});
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
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

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});

// seedDB();

// Core Routes
app.get("/", function(req, res){
  res.render("home");
});
app.get("/secret", isLoggedIn, function(req, res){
  res.render("secret-page");
});

app.get("/hub", isLoggedIn, function(req, res){
  User.findById(req.user._id).populate("receivedNotes").exec(function(err, user){
    if(err){
      console.log(err);
    } else {
      console.log(user.receivedNotes);
      res.render("hub", {user: user});
    }
  });
});

// Register Routes
app.get("/register", function(req, res){
  res.render("register");
});
app.post("/register", function(req, res){
  User.register(new User({username: req.body.username}), req.body.password, function(err, user){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secret");
      });
    }
  });
});

// Login/Logout
app.get("/login", function(req, res){
  res.render("login");
});
app.post("/login", passport.authenticate("local", {
  successRedirect: "/hub",
  failureRedirect: "/login"
}), function(req, res){
});
app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});


function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){
  console.log("The family site is running.");
})