const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  about: {
    type: String,
  },
  time: {
    type: String, //Fultime or Halftime
  },
  label: {
    type: String, //Intermideate/ Biggener/ Expert
  },
  price: {
    type: Number,
  },
  priceType: {
    type: String, //Fixed Price/ Hourly
  },
  location: {
    type: String,
  },
  type: {
    type: String, //One Type/Long Time/Complex Project
  },
  category: {
    type: String, //Fontend Developer/Full Stack Developer/Backend Developer
  },
  length: {
    type: String, //Under 3 Months / Over 3 Months
  },
  skills: [
    {
      skill: {
        type: String,
      },
    },
  ],
  proposers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "proposal",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  interviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  invites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  payment: {
    type: String,
    default: "notverified",
  },
  hiredDev: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  status: {
    type: String,
    default: "applying",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("projects", projectSchema);
