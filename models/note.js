var mongoose = require("mongoose");

var noteSchema = new mongoose.Schema({
  type: String,
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

module.exports = mongoose.model("Note", noteSchema);