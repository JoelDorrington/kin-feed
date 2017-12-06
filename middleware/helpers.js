var helpers = {},
  moment = require("moment"),
  sharp = require("sharp"),
  fs = require('fs'),
  Note = require("../models/note"),
  User = require("../models/user"),
  Thread = require("../models/thread"),
  RecentActivity = require("../models/recent-activity");

helpers.isLoggedIn = function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
};

// GET ALL DATA FUNCTION

helpers.getPublicData = function(page, nextFunction){
  helpers.infiniteScroll({"pub": true}, page, function(notes){
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
  });
};

helpers.populateThread = function(thread, page, nextFunction){
  Note.paginate({"thread": thread}, {page: page, limit: 5}, function(err, notes){
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
                threads: threads,
                mainThread: thread
              };
              nextFunction(data);
            }
          });
        }
      });
    }
  });
};

helpers.createNote = function(x, destination, res){
    Note.create(x, function(err, note){
    if(err){
      console.log(err);
    } else {
      note.date = moment();
      if(destination.username){
        note.recipient.id = destination._id;
        note.recipient.username = destination.username;
      }
      note.likes = {total: 0, users: []};
      note.save();
      destination.receivedNotes.unshift(note._id);
      destination.save();
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
          if(note.pub == false){
            nP = "/hub";
          } else if(note.thread){
            nP = "view#/thread/" + note.thread;
          } else {
            nP = "view#/public";
          }
          res.redirect(nP);
        }
      });
    }
  });
};

helpers.processAvatar = function(image, username, ext, cb){
  var path = 'public/uploads/'+username+'-avatar.'+ext;
  var avatar = 'uploads/'+username+'-avatar.'+ext;
  sharp(image).resize(100, 100).toFile(path, function(err, info){
    if(err){
      console.log(err);
    } else {
      fs.unlink(image, function(err){
        if(err){
          console.log(err);
        }else{
          cb(avatar);
        }
      });
    }
  });
};

helpers.deleteAvatar = function(imagePath){
  var image = 'public/' + imagePath; 
  if(imagePath !== "/uploads/profilepic-placeholder.png"){
    fs.unlink(image, function(err){if(err){console.log(err)}});
  }
};

helpers.processPhoto = function(image, filename, cb){
  sharp(image).resize(400).toFile('public/uploads/sm'+filename, function(err, info){
    if(err){
      console.log(err);
    } else {
      fs.unlink(image, function(err){
        if(err){
          console.log(err);
        }else{
          cb('uploads/sm'+filename);
        }
      });
    }
  });
};

helpers.infiniteScroll = function(query, page, callback){
  Note.paginate(query, {page: page, limit: 5, sort: 'date'}, function(err, notes){
    if(err){
      console.log(err);
    } else {
      callback(notes);
    }
  });
};

module.exports = helpers;

