const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  contact: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  role: {
    type: String,
    default: "developer",
  },
  avatar: {
    public_id: { type: String },
    url: { type: String },
  },
  banner: {
    public_id: { type: String },
    url: {
      type: String,
      default:
        "https://res.cloudinary.com/djbazdbnx/image/upload/v1679662727/banners/random-banner_grrrqf.jpg",
    },
  },
  // Edit After
  balance: {
    type: String,
    default: 0,
  },
  about: {
    type: String,
  },
  title: {
    type: String,
  },
  location: {
    type: String,
  },
  educations: [
    {
      school: {
        type: String,
      },
      degree: {
        type: String,
      },
      startDate: {
        type: String,
      },
      endDate: {
        type: String,
      },
      grade: {
        type: String,
      },
    },
  ],
  skills: [
    {
      skill: {
        type: String,
      },
    },
  ],
  languages: [
    {
      language: {
        type: String,
      },
    },
  ],
  experiences: [
    {
      title: {
        type: String,
      },
      description: {
        type: String,
      },
      time: {
        type: String,
      },
      certificate: {
        type: String,
      },
    },
  ],

  portfolios: [
    {
      title: {
        type: String,
      },
      description: {
        type: String,
      },
      images: [
        {
          image: {
            public_id: {
              type: String,
            },
            url: {
              type: String,
            },
          },
        },
      ],
      link: {
        type: String,
      },
      gitLink: {
        type: String,
      },
    },
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "question",
    },
  ],

  jobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "jobs",
    },
  ],

  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
  ],
  ongoingProjectsDev: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
  ],
  ongoingProjectsClient: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
  ],
  completeProjectsDev: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
  ],
  completeProjectsClient: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
  ],
  myJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "jobs",
    },
  ],
  myProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
  ],

  resetPasswordToken: String,
  resetPasswordExpire: String,
});

//Hashing Password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcryptjs.hash(this.password, 10);
});

//JWT Token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

//Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  //Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("user", userSchema);
