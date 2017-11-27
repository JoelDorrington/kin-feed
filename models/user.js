var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose"),
    Note = require("./note");
    
var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  receivedNotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note"
    }],
  pinnedNoteGroups: [{
    groupName: String,
    notes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note"
    }],
  }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);