var express = require("express"),
    router = express.Router({mergeParams: true}),
    Thread = require("../models/thread"),
    helpers = require("../middleware/helpers");

router.get("/", helpers.isLoggedIn, function(req, res){
  res.sendFile("/home/ubuntu/workspace/FamilyWebsite/angular-hub.html");
});

// CREATE THREAD
router.post("/thread/new", helpers.isLoggedIn, function(req, res){
  var newThread = {theme: req.body.theme, notes: []};
  Thread.create(newThread, function(err, thread){
    if(err){
      req.flash("error", err);
      res.redirect("notes/new", {users: []});
    } else {
      res.redirect("/notes/new/" + thread.theme);
    }
  });
});

module.exports = router;