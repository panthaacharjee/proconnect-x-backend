const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
  },
  bidPrice: {
    type: Number,
  },

  projectTime: {
    type: String,
  },
  coverLetter: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("proposal", proposalSchema);
