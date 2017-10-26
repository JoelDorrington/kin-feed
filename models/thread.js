var mongoose = require("mongoose");

var ThreadSchema = new mongoose.Schema({
  theme: String,
  receivedNotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note"
    }]
});

module.exports = mongoose.model("Thread", ThreadSchema);