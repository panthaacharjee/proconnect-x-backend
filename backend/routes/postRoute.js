const express = require("express");
const {
  createPost,
  getAllPosts,
  likeAndUnlikePost,
  deletePost,
  updatePost,
  addComment,
  updateComment,
  deleteComment,
  likeAndunlikeComment,
  addReply,
  likeAndunlikeReply,
  deleteReply,
  getPost,
  updateReply,
  getMyPost,
} = require("../controllers/postController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const router = express.Router();

router
  .route("/create/post")
  .post(isAuthenticatedUser, authorizeRoles("developer"), createPost);
router.route("/get/posts").get(getAllPosts);
router.route("/get/post/:id").get(getPost);

router
  .route("/post/likeAndunlike/:id")
  .get(isAuthenticatedUser, likeAndUnlikePost);
router
  .route("/post/delete/:id")
  .delete(isAuthenticatedUser, authorizeRoles("developer"), deletePost);

router
  .route("/post/update/:id")
  .put(isAuthenticatedUser, authorizeRoles("developer"), updatePost);

router.route("/comment/add/:id").post(isAuthenticatedUser, addComment);
router.route("/comment/update/:id").put(isAuthenticatedUser, updateComment);
router.route("/comment/delete/:id").delete(isAuthenticatedUser, deleteComment);
router
  .route("/comment/likeAndunlike/:id")
  .post(isAuthenticatedUser, likeAndunlikeComment);

router.route("/reply/add/:id").put(isAuthenticatedUser, addReply);
router
  .route("/reply/likeAndunlike/:id")
  .put(isAuthenticatedUser, likeAndunlikeReply);

router.route("/reply/delete/:id").put(isAuthenticatedUser, deleteReply);
router.route("/reply/update/:id").put(isAuthenticatedUser, updateReply);
router
  .route("/my/posts")
  .get(isAuthenticatedUser, authorizeRoles("developer"), getMyPost);

module.exports = router;
