var express = require("express"),
    router = express.Router({mergeParams: true}),
    Note = require("../models/note"),
    Thread = require("../models/thread"),
    User = require("../models/user");

router.get("/notes", function(req, res){
  Note.find({pub: true}, function(err, notes){
    if(err){
      console.log(err);
    } else {
      res.send(notes);
    }
  });
});

router.get("/user", function(req, res){
  res.send(req.user);
});

router.get("/pinneduser", function(req, res){
  User.findById(req.user._id).populate('pinnedNoteGroups.notes').exec(function(err, user){
    if(err){
      console.log(err);
    } else {
      res.send(user);
    }
  });
});

router.get("/threads", function(req, res){
  Thread.find({}, function(err, threads){
    if(err){
      console.log(err);
    } else {
      res.send(threads);
    }
  });
});

module.exports = router;