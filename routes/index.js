var express = require("express"),
    router = express.Router({mergeParams: true}),
    moment = require("moment"),
    User = require("../models/user"),
    RecentActivity = require("../models/recent-activity"),
    passport = require("passport"),
    helpers = require("../middleware/helpers");
    
// Root
router.get("/", function(req, res){
  res.render("home");
});


// Hub
router.get("/hub", helpers.isLoggedIn, function(req, res){
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

router.get("/view", helpers.isLoggedIn, function(req, res){
  res.sendFile("/home/ubuntu/workspace/FamilyWebsite/angular-hub.html");
});

router.get("/pinned", helpers.isLoggedIn, function(req, res){
  res.sendFile("/home/ubuntu/workspace/FamilyWebsite/angular-pins.html");
});

router.post("/pin", helpers.isLoggedIn, function(req, res){
  var id = req.body.id;
  User.findById(req.user._id, function(err, user){
    if(req.body.action){
      var foundGroup = false;
      user.pinnedNoteGroups.forEach(function(group){
        if(group.groupName == req.body.groupName){
          group.notes.push(id);
          foundGroup = true;
        }
      });
      if(!foundGroup){
        user.pinnedNoteGroups.push({groupName: req.body.groupName, notes: [id]});
      }
    } else {
      user.pinnedNoteGroups.forEach(function(group, index){
        if(group.notes.indexOf(String(id)) > -1){
          group.notes.splice(group.notes.indexOf(String(id), 1));
        }
        if(group.notes.length < 1){
          user.pinnedNoteGroups.splice(index, 1);
        }
      });
    }
    user.save();
    res.send(user.pinnedNoteGroups);
  });
});

// Register
router.get("/register", function(req, res){
  res.render("register");
});

router.post("/register", function(req, res){
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
router.get("/login", function(req, res){
  res.render("login");
});
router.post("/login", passport.authenticate("local", {
  successRedirect: "/hub",
  failureRedirect: "/login"
}), function(req, res){
});
router.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

module.exports = router;