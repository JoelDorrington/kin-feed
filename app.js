var express = require("express"),
    app = express(),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    moment = require("moment"),
    User = require("./models/user"),
    Note = require("./models/note"),
    RecentActivity = require("./models/recent-activity"),
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
// RecentActivity.create({notes: []}, function(err, recentActivity){
//   if(err){
//     console.log(err)
//   } else {
//     console.log("Created recent activity log")
//   }
// })

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
      RecentActivity.findById("59c385ad74e35a2139738986").populate("notes").exec(function(err, activity){
        if(err){
          console.log(err);
        } else {
          res.render("hub", {user: user, moment: moment, activity: activity});
        }
      });
    }
  });
});

//Note routes
app.get("/notes/new", isLoggedIn, function(req, res){
  User.find({}, function(err, users){
    if(err){
      console.log(err);
    } else {
      res.render("notes/new", {users: users});
    }
  });
});

app.get("/notes/reply/:id", isLoggedIn, function(req, res){
  User.findById(req.params.id, function(err, recip){
    if(err){
      console.log(err);
    } else {
      res.render("notes/reply", {recipient: recip});
    }
  });
});

app.post("/notes", isLoggedIn, function(req, res){
  var newNote = req.body.note;
  var Author = {id: req.user._id, username: req.user.username};
  newNote.author = Author;
  User.findById(newNote.recipient, function(err, user){
    if(err){
      console.log(err);
    } else {
      Note.create(newNote, function(err, note){
        if(err){
          console.log(err);
        } else {
          note.date = moment();
          note.recipient.id = user._id;
          note.recipient.username = user.username;
          note.save();
          user.receivedNotes.unshift(note._id);
          user.save();
          RecentActivity.find({}, function(err, recentActivity){
            if(err){
              console.log(err);
            } else {
              recentActivity[0].notes.unshift(note._id);
              if(recentActivity[0].notes.length > 5){
                recentActivity[0].notes.pop();
              }
              recentActivity[0].save();
              res.redirect("/hub");
            }
          });
        }
      });
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
        res.redirect("/hub");
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