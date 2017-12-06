var mongoose = require("mongoose");
var mongoosePaginate = require("mongoose-paginate");
var textSearch = require("mongoose-text-search");

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
  thread: String,
  image: [String]
});
NoteSchema.plugin(mongoosePaginate);
NoteSchema.plugin(textSearch);
NoteSchema.index({ content: 'text' });

module.exports = mongoose.model("Note", NoteSchema);