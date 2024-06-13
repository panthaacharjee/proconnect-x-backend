const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateRole,
  deleteUser,
  updateEducations,
  deleteEducations,
  updateSkills,
  deleteSkill,
  updateLanguages,
  deleteLanguage,
  updatePortfolios,
  deletePortfolio,
  updateExperince,
  deleteExperience,
  updateAvatar,
  updateBanner,
  updateAbout,
  allDeveloper,
  singleDeveloper,
  allUser,
} = require("../controllers/userController");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);
router.route("/me/update/avatar").put(isAuthenticatedUser, updateAvatar);
router.route("/me/update/banner").put(isAuthenticatedUser, updateBanner);
router.route("/me/update/about").put(isAuthenticatedUser, updateAbout);

router
  .route("/me/update/educations")
  .put(isAuthenticatedUser, updateEducations);

router
  .route("/me/delete/educations/:id")
  .put(isAuthenticatedUser, deleteEducations);

router.route("/me/update/skills").put(isAuthenticatedUser, updateSkills);

router.route("/me/delete/skills/:id").put(isAuthenticatedUser, deleteSkill);

router.route("/me/update/languages").put(isAuthenticatedUser, updateLanguages);

router
  .route("/me/delete/languages/:id")
  .put(isAuthenticatedUser, deleteLanguage);

router
  .route("/me/update/portfolios")
  .put(isAuthenticatedUser, updatePortfolios);

router
  .route("/me/delete/portfolios/:id")
  .put(isAuthenticatedUser, deletePortfolio);

router.route("/me/update/experience").put(isAuthenticatedUser, updateExperince);
router
  .route("/me/delete/experience/:id")
  .put(isAuthenticatedUser, deleteExperience);

router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateRole)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);
router.route("/all/developer").get(allDeveloper);
router.route("/single/developer/:id").get(singleDeveloper);
router
  .route("/user")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allUser);
router
  .route("/user/delete")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

module.exports = router;
