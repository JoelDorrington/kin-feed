var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");

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
  likes: {
    total: Number,
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  },
  thread: String
});
NoteSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Note", NoteSchema);