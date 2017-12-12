var express = require("express"),
    router = express.Router({mergeParams: true}),
    Note = require("../models/note"),
    Thread = require("../models/thread"),
    User = require("../models/user");

router.get("/notes", function(req, res){
  Note.find({pub: true}, function(err, notes){
    if(err){
      res.send(err);
    } else {
      res.send(notes);
    }
  });
});

router.get("/user", function(req, res){
  res.send(req.user);
});

router.get("/personalnotes", function(req, res){
  User.findById(req.user._id).populate('receivedNotes').exec(function(err, user){
    if(err){
      res.send(err);
    } else {
      res.send(user);
    }
  });
});

router.get("/pinneduser", function(req, res){
  User.findById(req.user._id).populate('pinnedNoteGroups.notes').populate('receivedNotes').exec(function(err, user){
    if(err){
      res.send(err);
    } else {
      res.send(user);
    }
  });
});

router.get("/threads", function(req, res){
  Thread.find({}, function(err, threads){
    if(err){
      res.send(err);
    } else {
      res.send(threads);
    }
  });
});

module.exports = router;