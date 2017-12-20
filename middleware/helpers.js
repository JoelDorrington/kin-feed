'use strict';

var helpers = {},
    moment  = require("moment"),
    sharp   = require("sharp"),
    fs      = require('fs'),
    Note    = require("../models/note"),
    sgMail  = require('@sendgrid/mail');

// configure AWS
var AWS = require('aws-sdk');
var avatarBucket = new AWS.S3({params: {Bucket: 'avatar-bucket0'}});
var imagesBucket = new AWS.S3({params: {Bucket: 'iMaGe-BuCkEt'}});

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
          // 
          // EMAIL CONFIG
          // vvvvvvvvvvvv
          var msg = {
            to: destination.email,
            from: 'KinFeed <noreply@kinfeed.net>',
            subject: 'Someone posted on your wall!',
            html: `<p>${note.author.username} posted on your wall. Check it out!'</p>`,
          };
          sgMail.send(msg);
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
  sharp(image).resize(100, 100).toFile(path, function(err, info){
    if(err){
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      var img = fs.readFileSync(path);
      var key = username+'-avatar.'+ext;
      var params = {Key: key, Body: img, ACL:'public-read'};
      avatarBucket.putObject(params, function(err, data){
        if(err){
          console.log(err);
        } else {
          fs.unlink(image, function(err){if(err){console.log(err)}else{console.log("image removed")}});
          fs.unlink(path, function(err){if(err){console.log(err)}else{console.log("path removed")}});
          cb('https://s3.amazonaws.com/avatar-bucket0/' + key);
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

helpers.processPhoto = function(image, filename){
  sharp(image).resize(400).toFile('public/uploads/sm'+filename, function(err, info){
    if(err){
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      var img = fs.readFileSync('public/uploads/sm'+filename);
      var key = filename;
      var params = {Key: key, Body: img, ACL:'public-read'};
      imagesBucket.putObject(params, function(err, data){
        if(err){
          console.log(err);
        } else {
          fs.unlink(image, function(err){if(err){console.log(err)}else{console.log("image removed")}});
          fs.unlink('public/uploads/sm'+filename, function(err){if(err){console.log(err)}else{console.log("path removed")}});
        }
      });
    }
  });
};

module.exports = helpers;

