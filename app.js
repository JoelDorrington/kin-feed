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
    Thread = require("./models/thread"),
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

// app.get("/hub", isLoggedIn, function(req, res){
//   User.findById(req.user._id).populate("receivedNotes").exec(function(err, user){
//     if(err){
//       console.log(err);
//     } else {
//       RecentActivity.findById("59c385ad74e35a2139738986").populate("notes").exec(function(err, activity){
//         if(err){
//           console.log(err);
//         } else {
//           res.render("hub", {user: user, moment: moment, activity: activity});
//         }
//       });
//     }
//   });
// });

// ANGULAR HUB ENTRY
app.get("/hub", isLoggedIn, function(req, res){
  res.sendFile(__dirname + "/angular-hub.html");
});

// ANGULAR AJAX DATA CALLS
app.get("/hub/notes", function(req, res){
  User.findById(req.user._id).populate("receivedNotes").exec(function(err, user){
    if(err){
      console.log(err);
    } else {
      res.send(user.receivedNotes);
    }
  });
});

app.get("/user", function(req, res){
  res.send(req.user);
});

app.get("/hub/recentactivity", function(req, res){
  RecentActivity.findById("59c385ad74e35a2139738986").populate("notes").exec(function(err, activity){
        if(err){
          console.log(err);
        } else {
          res.send(activity);
        }
      });
});

app.get("/public", isLoggedIn, function(req, res){
  getPublicData(function(data){
    data.notes.reverse();
    res.render("public", {data: data, moment: moment});
  });
});

app.get("/hub/public", isLoggedIn, function(req, res){
  getPublicData(function(data){
    data.notes.reverse();
    res.send(data);
  });
});

// CREATE THREAD
app.post("/public/thread/new", isLoggedIn, function(req, res){
  var newThread = {theme: req.body.theme, notes: []};
  Thread.create(newThread, function(err, thread){
    if(err){
      console.log(err);
    } else {
      res.redirect("/notes/new/" + thread.theme);
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

app.get("/notes/new/:thread", isLoggedIn, function(req, res){
      res.render("notes/new", {thread: req.params.thread});
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
  if(newNote.pub === "True"){
    newNote.pub = true;
  } else {
    newNote.pub = false;
  }
  var Author = {id: req.user._id, username: req.user.username};
  newNote.author = Author;
  if(newNote.recipient){
    User.findById(newNote.recipient, function(err, user){
      if(err){
        console.log(err);
      } else {
        createNote(newNote, user, res);
      }
    });
  } else {
    console.log(req.body.thread);
    Thread.find({theme: req.body.thread}, function(err, threads){
      if(err){
        console.log(err);
      } else {
        console.log(threads);
        createNote(newNote, threads[0], res);
      }
    });
  }
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

// GET ALL DATA FUNCTION

var getPublicData = function(nextFunction){
  Note.find({"pub": true}, function(err, notes){
    if(err){
      console.log(err);
    } else {
      User.find({}, function(err, users){
        if(err){
          console.log(err);
        } else {
          users.forEach(function(user){
            user.hash = "";
            user.salt = "";
          });
          Thread.find({}, function(err, threads){
            if(err){
              console.log(err);
            } else {
              var data = {
                notes: notes,
                users: users,
                threads: threads
              };
              nextFunction(data);
            }
          });
        }
      });
    }
  });
};

var createNote = function(x, model, res){
    Note.create(x, function(err, note){
    if(err){
      console.log(err);
    } else {
      note.date = moment();
      if(model.username){
        note.recipient.id = model._id;
        note.recipient.username = model.username;
      }
      note.save();
      model.receivedNotes.unshift(note._id);
      model.save();
      RecentActivity.find({}, function(err, recentActivity){
        if(err){
          console.log(err);
        } else {
          recentActivity[0].notes.unshift(note._id);
          if(recentActivity[0].notes.length > 5){
            recentActivity[0].notes.pop();
          }
          recentActivity[0].save();
          var nP;
          note.username ? nP = "/hub" : nP = "/public/";
          res.redirect(nP);
        }
      });
    }
  });
};


app.listen(process.env.PORT, process.env.IP, function(){
  console.log("The family site is running.");
})