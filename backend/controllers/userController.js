const catchAsyncError = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorhandler");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendMail = require("../utils/sendMail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

//Register User
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const emailUser = await User.findOne({ email });
  if (emailUser) {
    return next(new ErrorHandler("This user already exist.", 400));
  }

  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 300,
    height: 300,
    crop: "scale",
  });
  const user = await User.create({
    name,
    email,
    password,
    role,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
      // public_id: "myCloud.public_id",
      // url: "myCloud.secure_url",
    },
  });

  sendToken(user, 201, res);
});

// Login User
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email | !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  const user = await User.findOne({ email })
    .select("+password")
    .populate("posts")
    .populate("jobs")
    .populate("projects")
    .populate({
      path: "projects",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("myJobs")
    .populate({
      path: "myJobs",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate({
      path: "myProjects",
      populate: {
        path: "proposers",
        populate: {
          path: "user",
          options: { strictPopulate: false },
        },
      },
    })
    .populate({
      path: "myJobs",
      populate: {
        path: "applicants",
        populate: {
          path: "user",
          options: { strictPopulate: false },
        },
      },
    })
    .populate("myProjects")
    .populate({
      path: "myProjects",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate({
      path: "jobs",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate({
      path: "posts",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("questions")
    .populate({
      path: "questions",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("ongoingProjectsDev")
    .populate({
      path: "ongoingProjectsDev",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("ongoingProjectsClient")
    .populate({
      path: "ongoingProjectsClient",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("completeProjectsDev")
    .populate({
      path: "completeProjectsDev",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("completeProjectsClient")
    .populate({
      path: "completeProjectsClient",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    });

  if (!user) {
    return next(new ErrorHandler("Invalid email and password", 401));
  }
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  sendToken(user, 200, res);
});

//Logout User
exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

//Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  //Get Reset Password Token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `http://localhost:${process.env.FONTEND_URL}/password/reset/${resetToken}`;
  const message = `Your password reset token is :-\n\n ${resetPasswordUrl}\n\nIf you have not requested this email then, please ignore it`;

  try {
    await sendMail({
      email: user.email,
      subject: `Rabeya Group -- ${req.body.role} Password Recovary`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

//Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  //Creating Token Hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })
    .populate("posts")
    .populate("myJobs")
    .populate({
      path: "projects",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate({
      path: "myJobs",
      populate: {
        path: "applicants",
        populate: {
          path: "user",
          options: { strictPopulate: false },
        },
      },
    })
    .populate({
      path: "myProjects",
      populate: {
        path: "proposers",
        populate: {
          path: "user",
          options: { strictPopulate: false },
        },
      },
    })
    .populate({
      path: "myJobs",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("myProjects")
    .populate({
      path: "myProjects",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate({
      path: "posts",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("jobs")
    .populate({
      path: "jobs",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("projects")

    .populate("questions")
    .populate({
      path: "questions",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("ongoingProjectsDev")
    .populate({
      path: "ongoingProjectsDev",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("ongoingProjectsClient")
    .populate({
      path: "ongoingProjectsClient",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("completeProjectsDev")
    .populate({
      path: "completeProjectsDev",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("completeProjectsClient")
    .populate({
      path: "completeProjectsClient",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password != req.body.confirmPassword) {
    return next(new ErrorHandler("Please does not password", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});

//Get User Details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate("posts")
    .populate("jobs")
    .populate({
      path: "jobs",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("projects")

    .populate({
      path: "projects",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("myJobs")
    .populate({
      path: "myJobs",
      populate: {
        path: "applicants",
        populate: {
          path: "user",
          options: { strictPopulate: false },
        },
      },
    })
    .populate({
      path: "myJobs",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("myProjects")
    .populate({
      path: "myProjects",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate({
      path: "myProjects",
      populate: {
        path: "proposers",
        populate: {
          path: "user",
          options: { strictPopulate: false },
        },
      },
    })

    .populate({
      path: "posts",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("questions")
    .populate({
      path: "questions",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("ongoingProjectsDev")
    .populate({
      path: "ongoingProjectsDev",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("ongoingProjectsClient")
    .populate({
      path: "ongoingProjectsClient",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("completeProjectsDev")
    .populate({
      path: "completeProjectsDev",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("completeProjectsClient")
    .populate({
      path: "completeProjectsClient",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    });

  res.status(200).json({
    success: true,
    user,
  });
});

//Update User Password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select("+password")
    .populate("posts")
    .populate("jobs")
    .populate("projects")
    .populate({
      path: "projects",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("myJobs")
    .populate({
      path: "myJobs",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate({
      path: "myJobs",
      populate: {
        path: "applicants",
        populate: {
          path: "user",
          options: { strictPopulate: false },
        },
      },
    })
    .populate("myProjects")
    .populate({
      path: "myProjects",
      populate: {
        path: "proposers",
        populate: {
          path: "user",
          options: { strictPopulate: false },
        },
      },
    })
    .populate({
      path: "myProjects",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate({
      path: "jobs",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate({
      path: "posts",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("questions")
    .populate({
      path: "questions",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("ongoingProjectsDev")
    .populate({
      path: "ongoingProjectsDev",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("ongoingProjectsClient")
    .populate({
      path: "ongoingProjectsClient",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("completeProjectsDev")
    .populate({
      path: "completeProjectsDev",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    })
    .populate("completeProjectsClient")
    .populate({
      path: "completeProjectsClient",
      populate: {
        path: "owner",
        options: { strictPopulate: false },
      },
    });
  const isPassowrdMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPassowrdMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not matched", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

//Update User Profile
exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    title: req.body.title,
    location: req.body.location,
    contact: req.body.contact,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    user,
  });
});

// Update Avatar Image
exports.updateAvatar = catchAsyncError(async (req, res, next) => {
  const newUserData = {};

  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    const imageId = user.avatar.public_id;

    if (imageId) {
      await cloudinary.v2.uploader.destroy(imageId);
    }

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 200,
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    user,
  });
});

// Update Banner Image
exports.updateBanner = catchAsyncError(async (req, res, next) => {
  const newUserData = {};

  if (req.body.banner !== "") {
    const user = await User.findById(req.user.id);

    const imageId = user.banner.public_id;

    if (imageId) {
      await cloudinary.v2.uploader.destroy(imageId);
    }

    const myCloud = await cloudinary.v2.uploader.upload(req.body.banner, {
      folder: "banners",
      width: 900,
      height: 300,
      crop: "scale",
    });

    newUserData.banner = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    user,
  });
});

//Update User About
exports.updateAbout = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    about: req.body.about,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    user,
  });
});

//Update User Password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const isPassowrdMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPassowrdMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not matched", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

//Update User Education
exports.updateEducations = catchAsyncError(async (req, res, next) => {
  const education = {
    school: req.body.school,
    degree: req.body.degree,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    grade: req.body.grade,
  };
  const user = await User.findById(req.user._id);

  user.educations.push(education);

  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    user,
  });
});
//Delete User Education
exports.deleteEducations = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const educations = user.educations.filter(
    (edu) => edu._id.toString() !== req.params.id.toString()
  );

  await User.findByIdAndUpdate(
    req.user._id,
    { educations },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "Successfully Deleted",
  });
});

//Update User Skill
exports.updateSkills = catchAsyncError(async (req, res, next) => {
  const skill = {
    skill: req.body.skill,
  };
  const user = await User.findById(req.user._id);

  user.skills.push(skill);

  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    user,
  });
});
//Delete User Skill
exports.deleteSkill = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const skills = user.skills.filter(
    (skill) => skill._id.toString() !== req.params.id.toString()
  );

  await User.findByIdAndUpdate(
    req.user._id,
    { skills },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "Successfully Deleted",
  });
});

//Update User Languages
exports.updateLanguages = catchAsyncError(async (req, res, next) => {
  const language = {
    language: req.body.language,
  };
  const user = await User.findById(req.user._id);

  user.languages.push(language);

  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    user,
  });
});
//Delete User Skill
exports.deleteLanguage = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const languages = user.languages.filter(
    (language) => language._id.toString() !== req.params.id.toString()
  );

  await User.findByIdAndUpdate(
    req.user._id,
    { languages },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "Successfully Deleted",
  });
});

//Update User Experince
exports.updateExperince = catchAsyncError(async (req, res, next) => {
  const experince = {
    title: req.body.title,
    description: req.body.description,
    time: req.body.time,
    certificate: req.body.certificate,
  };
  const user = await User.findById(req.user._id);

  user.experiences.push(experince);

  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    user,
  });
});

//Delete User Portfolios
exports.deleteExperience = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const experiences = user.experiences.filter(
    (experience) => experience._id.toString() !== req.params.id.toString()
  );

  await User.findByIdAndUpdate(
    req.user._id,
    { experiences },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  // await user.save();
  res.status(200).json({
    success: true,
    message: "Successfully Deleted",
    // message: experiences,
  });
});

//Update User Portfolios
exports.updatePortfolios = catchAsyncError(async (req, res, next) => {
  const portfolio = {
    title: req.body.title,
    description: req.body.description,
    link: req.body.link,
    gitLink: req.body.gitLink,
  };
  const user = await User.findById(req.user._id);

  user.portfolios.push(portfolio);

  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    user,
  });
});

//Delete User Portfolios
exports.deletePortfolio = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const portfolios = user.portfolios.filter(
    (portfolio) => portfolio._id.toString() !== req.params.id.toString()
  );

  await User.findByIdAndUpdate(
    req.user._id,
    { portfolios },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "Successfully Deleted",
  });
});

//Get All User --Admin
exports.getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//Get Single User --Admin
exports.getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id : ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//Update User Role
exports.updateRole = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    user,
  });
});

//Delete User  ---Admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

//All Developer
exports.allDeveloper = catchAsyncError(async (req, res, next) => {
  const developer = await User.find({ role: "developer" });

  if (!developer) {
    return next(new ErrorHandler(`No Developer Found`));
  }

  res.status(200).json({
    success: true,
    developer: developer,
  });
});

//Single Developer
exports.singleDeveloper = catchAsyncError(async (req, res, next) => {
  const developer = await User.findById(req.params.id);

  if (!developer) {
    return next(new ErrorHandler(`No Developer Found`));
  }

  res.status(200).json({
    success: true,
    developer: developer,
  });
});

exports.allUser = catchAsyncError(async (req, res, next) => {
  const user = await User.find();

  if (!user) {
    return next(new ErrorHandler(`No User Found`));
  }

  res.status(200).json({
    success: true,
    user: user,
  });
});

exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.body.userId);

  if (!user) {
    return next(new ErrorHandler(`No User Found`));
  }
  await User.findByIdAndDelete(req.body.userId);
  const users = await User.find();
  res.status(200).json({
    success: true,
    users: users,
  });
});
