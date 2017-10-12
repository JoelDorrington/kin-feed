var mongoose  = require("mongoose"),
    Note      = require("./note");

var RecentActivitySchema = new mongoose.Schema({
  notes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note"
  }]
});

module.exports = mongoose.model("RecentActivity", RecentActivitySchema);