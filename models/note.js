var mongoose = require("mongoose");

var NoteSchema = new mongoose.Schema({
  kind: String,
  content: String,
  pub: Boolean,
  date: Date,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  recipient: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String 
  },
  likes: Number
});

module.exports = mongoose.model("Note", NoteSchema);