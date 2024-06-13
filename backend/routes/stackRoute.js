const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const {
  createQuestion,
  getAllQuestions,
  getQuestion,
  likeAndUnlikeQuestion,
  addAnswer,
  updateAnswer,
  deleteAnswer,
  likeAndunlikeAnswer,
  viewedQuestion,
  deleteQuestion,
} = require("../controllers/stackController");

router
  .route("/create/question")
  .post(isAuthenticatedUser, authorizeRoles("developer"), createQuestion);
router.route("/get/questions").get(getAllQuestions);
router.route("/get/question/:id").get(getQuestion);
router
  .route("/delete/question/:id")
  .delete(isAuthenticatedUser, authorizeRoles("developer"), deleteQuestion);
router
  .route("/get/likeAndunlikeQuestion/:id")
  .get(isAuthenticatedUser, likeAndUnlikeQuestion);

router.route("/question/viewed/:id").get(isAuthenticatedUser, viewedQuestion);

router.route("/answer/add/:id").post(isAuthenticatedUser, addAnswer);
router.route("/answer/update/:id").put(isAuthenticatedUser, updateAnswer);
router.route("/answer/delete/:id").put(isAuthenticatedUser, deleteAnswer);
router
  .route("/answer/likeandunlike/:id")
  .get(isAuthenticatedUser, likeAndunlikeAnswer);

module.exports = router;
