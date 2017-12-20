var express = require("express"),
    router = express.Router({mergeParams: true}),
    multer = require('multer'),
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
    Note = require("../models/note"),
    Thread = require("../models/thread"),
    helpers = require("../middleware/helpers");

//Note routes
router.get("/new", helpers.isLoggedIn, function(req, res){
  User.find({}, function(err, users){
    if(err){
      req.flash("error", err);
      res.render("notes/new", {users: []});
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
      req.flash("error", err);
      res.render("notes/new", {users: []});
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
      res.send({likes: note.likes.total});
    }
  });
});

router.post("/", helpers.isLoggedIn, upload.array('photo'), function(req, res){
  var newNote = req.body.note;
  if(req.files){
    newNote.image = [];
    req.files.forEach(function(file){
      helpers.processPhoto(file.path, file.filename, function(image){});
      newNote.image.push('https://s3.amazonaws.com/iMaGe-BuCkEt/' + file.filename);
    });
  }
  if(newNote.pub === "True"){
    newNote.pub = true;
    newNote.likes = 0;
  } else {
    newNote.pub = false;
  }
  var Author = {id: req.user._id, username: req.user.username, avatar: req.user.avatar};
  newNote.author = Author;
  if(!newNote.pub && newNote.recipient === "null"){
    req.flash("error", "Please choose a recipient for this private post.");
    res.redirect("back");
  }
  else if(newNote.recipient){
    if(newNote.recipient === "null"){
      newNote.recipient = {};
      newNote.recipient.username = "Everyone";
      newNote.recipient._id = null;
      helpers.createNote(newNote, null, res, req);
    }
    else{
      User.findById(newNote.recipient, function(err, user){
        if(err){
          req.flash("error", err.message);
          res.redirect("back");
        } else {
          helpers.createNote(newNote, user, res, req);
        }
      }); 
    }
  } else {
    newNote.thread = req.body.thread;
    Thread.find({theme: req.body.thread}, function(err, threads){
      if(err){
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        helpers.createNote(newNote, threads[0], res, req);
      }
    });
  }
});

module.exports = router;