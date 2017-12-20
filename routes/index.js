var express = require("express"),
    router = express.Router({mergeParams: true}),
    multer = require('multer'),
    fs = require("fs"),
    storage = multer.diskStorage({
      destination: function(req, file, cb){
        cb(null, 'public/uploads');
      },
      filename: function(req, file, cb){
        cb(null, Date.now() + '-' + file.originalname);
      }
    }),
    upload = multer({storage: storage}),
    User = require("../models/user"),
    passport = require("passport"),
    helpers = require("../middleware/helpers");
    
// Root
router.get("/", function(req, res){
  res.render("home");
});

router.get("/view", helpers.isLoggedIn, function(req, res){
  res.sendFile(process.cwd() + "/angular-hub.html");
});

router.post("/pin", helpers.isLoggedIn, function(req, res){
  var id = req.body.id;
  User.findById(req.user._id, function(err, user){
    if(err){
      res.send(err);
    } else {
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
    }
  });
});

// Register
router.get("/register", function(req, res){
  res.render("register");
});

router.post("/register", upload.single('avatar'), function(req, res){
  if(req.file){
    var ext = req.file.mimetype.slice(req.file.mimetype.indexOf('/')+1);
    helpers.processAvatar(req.file.path, req.body.username, ext, function(path){
      User.register(new User({username: req.body.username, email: req.body.email, avatar: path}), req.body.password, function(err, user){
        if(err){
          fs.unlink(path, function(){});
          req.flash("error", err.message);
          res.redirect("back");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/view#/home");
          });
        }
      });
    });
  } else {
    User.register(new User({username: req.body.username, email: req.body.email, avatar: "https://kin-feed.herokuapp.com/uploads/profilepic-placeholder.png"}), req.body.password, function(err, user){
        if(err){
          req.flash("error", err.message);
          res.redirect("back");
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/view#/home");
          });
        }
      });
  }
});

// Change Avatar
router.get('/profile', helpers.isLoggedIn, function(req, res){
  res.render('profile');
});

router.post('/profile', helpers.isLoggedIn, upload.single('avatar'), function(req, res){
  var ext = req.file.mimetype.slice(req.file.mimetype.indexOf('/')+1);
  helpers.processAvatar(req.file.path, req.user.username, ext, function(path){
      User.findByIdAndUpdate(req.user._id, {$set: {avatar: path}}, function(err, user){
        if(err){
          req.flash("error", err.message);
          res.redirect("back");
        } else {
          res.redirect("/view#/home");
        }
      });
  });
});

router.get("/deleteavatar", helpers.isLoggedIn, function(req, res){
  User.findByIdAndUpdate(req.user._id, {$set: {avatar: "https://kin-feed.herokuapp.com/uploads/profilepic-placeholder.png"}}, function(err, user){
    if(err){
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      res.redirect("/view#/home");
    }
  });
  
});

// Login/Logout
router.get("/login", function(req, res){
  res.render("login");
});
router.post("/login", passport.authenticate("local", {
  successRedirect: "/view#/home",
  failureRedirect: "/login"
}), function(req, res){
});
router.get("/logout", function(req, res){
  req.logout();
  res.redirect("/login");
});

module.exports = router;