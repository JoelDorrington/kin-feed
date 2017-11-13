var helpers = {},
  moment = require("moment"),
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

helpers.createNote = function(x, model, res){
    Note.create(x, function(err, note){
    if(err){
      console.log(err);
    } else {
      note.date = moment();
      if(model.username){
        note.recipient.id = model._id;
        note.recipient.username = model.username;
      }
      note.likes = {total: 0, users: []};
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
          if(note.pub == false){
            nP = "/hub";
          } else if(note.thread){
            nP = "/public#/" + note.thread;
          } else {
            nP = "/public";
          }
          res.redirect(nP);
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

