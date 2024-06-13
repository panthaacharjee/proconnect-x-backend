const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require("../models/userModel");
const Job = require("../models/job-model/jobModel");
const ErrorHandler = require("../utils/errorhandler");
const ApiFetaures = require("../utils/apiFeatures");
const sendMail = require("../utils/sendMail");
const cloudinary = require("cloudinary").v2;

//Create Job
exports.createJob = catchAsyncError(async (req, res, next) => {
  const newJobData = {
    name: req.body.caption,
    about: req.body.about,
    owner: req.user,
    time: req.body.time,
    label: req.body.label,
    salary: req.body.salary,
    location: req.body.location,
    startEmployee: req.body.startEmployee,
    endEmployee: req.body.endEmployee,
  };
  const newJob = await Job.create(newJobData);
  const user = await User.findById(req.user._id);
  user.myJobs.push(newJob._id);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Successfully Job created",
    job: newJob,
  });
});

//Get All Job
exports.getAllJobs = catchAsyncError(async (req, res, next) => {
  const apifeatures = new ApiFetaures(
    Job.find().sort({ createdAt: -1 }).populate("owner"),
    req.query
  ).search();
  const jobs = await apifeatures.query;

  res.status(200).json({
    success: true,
    jobs,
  });
});

//Get Single Job
exports.getJob = catchAsyncError(async (req, res, next) => {
  const job = await Job.findById(req.params.id).populate("owner");
  if (!job) {
    return next(new ErrorHandler("Job Not Found", 404));
  }

  res.status(200).json({
    success: true,
    job: job,
  });
});

//Apply Single Job
exports.applyJob = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const job = await Job.findById(req.params.id);
  if (!job) {
    return next(new ErrorHandler("Job Not Found", 404));
  }
  const result = await cloudinary.uploader.upload(req.body.cv, {
    folder: "cv",
    resource_type: "auto",
  });
  const applicantData = {
    user: req.user,
    cv: result.secure_url,
  };
  await job.applicants.push(applicantData);
  await job.save();

  const newJob = await Job.findById(req.params.id).populate("owner");

  await user.jobs.push(newJob._id);
  await user.save();
  res.status(200).json({
    success: true,
    job: newJob,
  });
});

// Send Mail to Applicants
exports.sendMailApplicants = catchAsyncError(async (req, res, next) => {
  const applicants = req.body.applicants;
  applicants.forEach(async (val) => {
    const message = `Hello ${val.user.name}! You are selected for job interview in this ${req.body.jobDesc.name}. Please come to our office. Address :${req.body.jobDesc.location} Contact Number :${req.body.jobDesc.owner.contact}. Don't forget to bring CV`;
    try {
      await sendMail({
        email: val.user.email,
        subject: `Dev Community----${req.body.jobDesc.name} job interview`,
        message,
      });
    } catch (err) {
      console.log(err);
    }
  });
  // console.log(applicants.length);
  res.status(200).json({
    success: true,
  });
});

// Delete Job
exports.deleteJob = catchAsyncError(async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    return next(new ErrorHandler("Job Not Found", 404));
  }
  if (job.owner.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized", 401));
  } else {
    await Job.findByIdAndDelete(req.params.id);

    const user = await User.findById(req.user._id);
    const index = user.myJobs.indexOf(req.params.id);
    user.myJobs.splice(index, 1);
    await user.save();
  }
  res.status(200).json({
    success: true,
  });
});
