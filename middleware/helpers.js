'use strict';

var helpers = {},
  moment = require("moment"),
  sharp = require("sharp"),
  fs = require('fs'),
  Note = require("../models/note"),
  User = require("../models/user"),
  Thread = require("../models/thread"),
  RecentActivity = require("../models/recent-activity");
  
const nodemailer = require('nodemailer');

helpers.isLoggedIn = function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash("error", "Please log in.");
  res.redirect("/login");
};

helpers.createNote = function(x, destination, res, req){
    Note.create(x, function(err, note){
    if(err){
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      note.date = moment();
      if(x.pub){
        note.likes = {total: 0, users: []};
      }
      if(destination){
        destination.receivedNotes.unshift(note._id);
        destination.save();
        if(destination.username){
          note.recipient.id = destination._id;
          note.recipient.username = destination.username;
          note.recipient.avatar = destination.avatar;
          console.log("Emailing...");
          // 
          // EMAIL CONFIG
          // vvvvvvvvvvvv
          let smtpTransport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            service: "Gmail",
            auth: {
              type: "OAuth2",
              user: "joel.dorrington0@gmail.com",
              clientId: "889654612616-oj1ckgtbeei8eoqja9aaaggtgv3l0cr7.apps.googleusercontent.com",
              clientSecret: "EydF-KrgYOv5qPl-zEKEYLVw",
              refreshToken: "1/UONY8gpqX8yzxQKAJXUSobAPyhHl1k0tavc61GwS6Ug"
            }
          });

          let mailOptions = {
            from: '"KinFeed" <joel.dorrington0@gmail.com>',
            to: destination.email,
            subject: x.author.username + " posted on your wall!",
            html: `
            <h1>New Post!</h1>
            <p>${x.author.username} posted on your wall! Check it out!</p>
            `
          };
          smtpTransport.sendMail(mailOptions, function(err, info){
            if(err){
              console.log(err);
            }
            smtpTransport.close();
          });
        // END EMAIL CONFIG
        }
      }
      note.save();
      var nP;
      if(note.pub == false){
        nP = "/view#/home";
      } else if(note.thread){
        nP = "/view#/thread/" + note.thread;
      } else {
        nP = "/view#/public";
      }
      res.redirect(nP);
    }
  });
};

helpers.processAvatar = function(image, username, ext, cb){
  var path = 'public/uploads/'+username+'-avatar.'+ext;
  var avatar = 'uploads/'+username+'-avatar.'+ext;
  sharp(image).resize(100, 100).toFile(path, function(err, info){
    if(err){
      req.flash("error", err);
      res.redirect("back");
    } else {
      fs.unlink(image, function(err){
        if(err){
          req.flash("error", err);
          res.redirect("back");
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
      req.flash("error", err);
      res.redirect("back");
    } else {
      fs.unlink(image, function(err){
        if(err){
          req.flash("error", err);
        res.redirect("back");
        }else{
          cb('uploads/sm'+filename);
        }
      });
    }
  });
};

module.exports = helpers;

