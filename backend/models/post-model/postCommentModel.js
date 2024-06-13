const mongoose = require("mongoose");

const postCommentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "post",
  },
  comment: {
    type: String,
    // required: [true, "Please enter post heading"],
  },
  image: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  replies: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      reply: {
        type: String,
      },
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
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("postComment", postCommentSchema);
