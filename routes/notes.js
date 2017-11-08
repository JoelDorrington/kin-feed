var express = require("express"),
    router = express.Router({mergeParams: true}),
    User = require("../models/user"),
    Note = require("../models/note"),
    Thread = require("../models/thread"),
    helpers = require("../middleware/helpers");

//Note routes
router.get("/new", helpers.isLoggedIn, function(req, res){
  User.find({}, function(err, users){
    if(err){
      console.log(err);
    } else {
      res.render("notes/new", {users: users});
    }
  });
});

router.get("/new/:thread", helpers.isLoggedIn, function(req, res){
  res.render("notes/new", {thread: req.params.thread});
});

router.get("/reply/:id", helpers.isLoggedIn, function(req, res){
  User.findById(req.params.id, function(err, recip){
    if(err){
      console.log(err);
    } else {
      res.render("notes/reply", {recipient: recip});
    }
  });
});

router.get("/likes/:id", helpers.isLoggedIn, function(req, res){
  var id = req.user._id;
  Note.findById(req.params.id, function(err, note){
    if(err){
      console.log(err);
    } else {
      if(note.likes.users.indexOf(id) < 0){
        note.likes.total++;
        note.likes.users.push(id);
      } else {
        note.likes.total--;
        note.likes.users.splice(note.likes.users.indexOf(id), 1);
      }
      note.save();
      res.redirect("back");
    }
  });
});

router.post("/", helpers.isLoggedIn, function(req, res){
  var newNote = req.body.note;
  if(newNote.pub === "True"){
    newNote.pub = true;
    newNote.likes = 0;
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
        helpers.createNote(newNote, user, res);
      }
    });
  } else {
    newNote.thread = req.body.thread;
    Thread.find({theme: req.body.thread}, function(err, threads){
      if(err){
        console.log(err);
      } else {
        helpers.createNote(newNote, threads[0], res);
      }
    });
  }
});

module.exports = router;