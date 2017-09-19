var mongoose = require("mongoose");
var Note = require("./models/note");
var User = require("./models/user");
var joelId = {type: mongoose.Types.ObjectId("59be78ab3d3a4b0f3d41a493"), ref: "User"};
var notes = [
  {
  kind: "gratitude",
  content: "Tsara is grateful for the time you made breakfast", 
  // date: "Today",
  recipient: [{
    id: joelId,
    username: "Joel"
  }]
  },
  
  {
  kind: "memory",
  content: "Chantal remembers the time you went to mexico", 
  // date: "yesterday",
  recipient: [
    {
    id: joelId,
    username: "Joel"
    }
  ]
  },
  
  {
  kind: "encouragement",
  content: "Alex believes you've got what it takes", 
  // date: "A week ago",
  recipient: [{
    id: joelId,
    username: "Joel"
  }]
  }];

function seedDB(){
  //remove all campgrounds
  Note.remove({}, function(err){
    if(err){
      console.log(err);
    } else {
      console.log("removed notes");
      //add campgrounds
      User.findById("59c0f9fb8a05722158eb1b9d", function(err, user){
        if(err){
          console.log(err);
        } else {
          console.log(user)
              notes.forEach(function(seed){
            console.log(seed);
            Note.create(seed, function(err, note){
              if(err){
                console.log(err);
              } else {
                console.log("added note");
                console.log(note);
                // add note to Joels note list
                user.receivedNotes.push(note);
                user.save();
                console.log("note associated to user");
              }
            });
          });
            }
          });
          };
        }
      );
    }

module.exports = seedDB;