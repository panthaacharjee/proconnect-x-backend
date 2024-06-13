const mongoose = require("mongoose");

const stackSchema = new mongoose.Schema({
  question: {
    type: String,
  },

  description: {
    type: String,
  },
  tags: [
    {
      tag: {
        type: String,
      },
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  answers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "questionAnswer",
    },
  ],
  views: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("question", stackSchema);
