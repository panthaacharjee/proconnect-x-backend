const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const {
  createProject,
  getAllPrjects,
  getProject,
  applyProject,
  hireDeveloper,
  completeProjects,
} = require("../controllers/projectController");

router
  .route("/create/project")
  .post(isAuthenticatedUser, authorizeRoles("client"), createProject);

router.route("/get/projects").get(getAllPrjects);
router.route("/get/project/:id").get(getProject);
router
  .route("/create/project/apply/:id")
  .post(isAuthenticatedUser, authorizeRoles("developer"), applyProject);
router
  .route("/hire/developer")
  .post(isAuthenticatedUser, authorizeRoles("client"), hireDeveloper);
router
  .route("/complete/project")
  .post(isAuthenticatedUser, authorizeRoles("client"), completeProjects);
module.exports = router;
