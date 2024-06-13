const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    // required: [true, "Please enter post heading"],
  },
  images: [
    {
      public_id: {
        type: String,
        // required: true,
      },
      original: {
        type: String,
        // required: true,
      },
      thumbnail: {
        type: String,
        // required: true,
      },
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "postComment",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("post", postSchema);
