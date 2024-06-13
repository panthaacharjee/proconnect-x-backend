const express = require("express");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const {
  createJob,
  getAllJobs,
  getJob,
  applyJob,
  sendMailApplicants,
  deleteJob,
} = require("../controllers/jobController");
const router = express.Router();

router
  .route("/create/job")
  .post(isAuthenticatedUser, authorizeRoles("client"), createJob);

router.route("/get/jobs").get(getAllJobs);
router.route("/get/job/:id").get(getJob);
router
  .route("/apply/job/:id")
  .put(isAuthenticatedUser, authorizeRoles("developer"), applyJob);
router
  .route("/send/mail/applicants")
  .post(isAuthenticatedUser, authorizeRoles("client"), sendMailApplicants);
router
  .route("/delete/job/:id")
  .delete(isAuthenticatedUser, authorizeRoles("client"), deleteJob);

module.exports = router;
