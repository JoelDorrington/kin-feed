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
var options = {
  port: 587,
  host: 'smtp-mail.outlook.com',
  auth: {
    user: 'joel_dorrington@hotmail.com',
    pass: 'Nitemare0'
  },
  tls: {
    rejectUnauthorized: false
  }
};

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
          console.log("Emailing...");
          let transporter = nodemailer.createTransport(options);

          let mailOptions = {
            from: '"KinFeed" <joel_dorrington@hotmail.com>',
            to: 'joel.dorrington0@gmail.com',
            subject: "Someone posted on your wall!",
            html: `
            <h1>Test Email</h1>
            `
          };
          transporter.sendMail(mailOptions, function(err, info){
            if(err){
              console.log(err);
            } else {
              console.log("Message sent: %s", info.messageId);
            }
          });
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

