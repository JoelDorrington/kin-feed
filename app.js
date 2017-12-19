var express = require("express"),
    app = express(),
    flash = require("connect-flash"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStategy = require("passport-local"),
    User = require("./models/user");

// Connect Routes
var noteRoutes = require("./routes/notes"),
    publicRoutes = require("./routes/public"),
    ajaxRoutes = require("./routes/ajax"),
    indexRoutes = require("./routes/index");

// Configure Mongoose and App
mongoose.connect(process.env.DATABASEURL, {useMongoClient: true});
mongoose.Promise = global.Promise;
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// Configure Passport
app.use(require("express-session")({
  secret: "TbFhMmFw2017",
  resave: false,
  saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global Resources
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});


// Routing
app.use("/notes", noteRoutes);
app.use("/public", publicRoutes);
app.use("/ajax", ajaxRoutes);
app.use(indexRoutes);

app.listen(process.env.PORT, process.env.IP);