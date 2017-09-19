var mongoose = require("mongoose");

var NoteSchema = new mongoose.Schema({
  kind: String,
  content: String,
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
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Like"
    }
    ]
});

module.exports = mongoose.model("Note", NoteSchema);