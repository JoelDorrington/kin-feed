var express = require("express"),
    router = express.Router({mergeParams: true}),
    moment = require("moment"),
    Note = require("../models/note"),
    Thread = require("../models/thread"),
    helpers = require("../middleware/helpers");

router.get("/", helpers.isLoggedIn, function(req, res){
  res.sendFile("/home/ubuntu/workspace/FamilyWebsite/angular-hub.html");
});

router.get("/search", helpers.isLoggedIn, function(req, res){
  Note.textSearch(req.query.query, function(err, output){
    if(err){
      console.log(err);
    } else {
      Thread.find({}, function(err, threads){
        if(err){
          console.log(err);
        } else {
          var data = {
            notes: {docs: output.results},
            threads: threads
          };
          for(var i = 0; i < data.notes.docs.length; i++){
            var score = data.notes.docs[i].score;
            data.notes.docs[i] = data.notes.docs[i].obj;
            data.notes.docs[i].score = score;
          }
          res.render("public", {data: data, moment: moment});
        }
      });
    }
  });
});

router.get("/:thread", helpers.isLoggedIn, function(req, res){
  var page = parseInt(req.query.page, 10);
  if(!page){
    page = 1;
  }
  helpers.populateThread(req.params.thread, page, function(data){
    // data.notes.reverse();
    res.render("public", {data: data, moment: moment});
  });
});

// CREATE THREAD
router.post("/thread/new", helpers.isLoggedIn, function(req, res){
  var newThread = {theme: req.body.theme, notes: []};
  Thread.create(newThread, function(err, thread){
    if(err){
      console.log(err);
    } else {
      res.redirect("/notes/new/" + thread.theme);
    }
  });
});

module.exports = router;