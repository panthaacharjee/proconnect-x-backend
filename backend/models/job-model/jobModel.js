const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  about: {
    type: String,
  },
  time: {
    type: String,
  },
  label: {
    type: String,
  },
  salary: {
    type: String,
  },
  location: {
    type: String,
  },
  applicants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      cv: {
        type: String,
      },
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  startEmployee: {
    type: Number,
  },
  endEmployee: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("jobs", jobSchema);
