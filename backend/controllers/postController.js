const catchAsyncError = require("../middlewares/catchAsyncError");
const Comment = require("../models/post-model/postCommentModel");
const Post = require("../models/post-model/postModel");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorhandler");
const cloudinary = require("cloudinary").v2;

//Create Post
exports.createPost = catchAsyncError(async (req, res, next) => {
  const urls = [];

  if (!req.body.caption && !req.body.images) {
    return next(new ErrorHandler("This field is required", 401));
  }

  if (req.body.images) {
    for (var i = 0; i < req.body.images.length; i++) {
      const result = await cloudinary.uploader.upload(req.body.images[i], {
        folder: "post",
        height: 600,
        width: 650,
      });
      urls.push({
        public_id: result.public_id,
        original: result.secure_url,
        thumbnail: result.secure_url,
      });
    }
  }

  const newPostData = {
    caption: req.body.caption,
    images: urls,
    owner: req.user,
  };
  const newPost = await Post.create(newPostData);
  const user = await User.findById(req.user._id);
  user.posts.push(newPost._id);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Successfully Post created",
    post: newPost,
  });
});

//Get All Post
exports.getAllPosts = catchAsyncError(async (req, res, next) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("owner")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        options: { strictPopulate: false },
      },
    });
  // .populate({
  //   path: "comments",
  //   populate: { path: "user", options: { strictPopulate: false } },
  // });
  // .populate({
  //   path: "comments",
  //   populate: {
  //     path: "replies",
  //     populate: {
  //       path: "user",
  //       options: { strictPopulate: false },
  //     },
  //   },
  // });

  res.status(200).json({
    success: true,
    posts: posts,
  });
});

//Single Post
exports.getPost = catchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate("owner")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        options: { strictPopulate: false },
      },
    })
    .populate({
      path: "comments",
      populate: {
        path: "replies",
        populate: {
          path: "user",
          options: { strictPopulate: false },
        },
      },
    });

  if (!post) {
    return next(new ErrorHandler("Post Not found", 401));
  }
  res.status(201).json({
    success: true,
    post,
  });
});

//Delete Post
exports.deletePost = catchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorHandler("Post Not Found", 404));
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized", 401));
  } else {
    await Post.findByIdAndDelete(req.params.id);

    const user = await User.findById(req.user._id);
    const index = user.posts.indexOf(req.params.id);
    user.posts.splice(index, 1);
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: "Post Successfully Deleted",
  });
});

// Like and Unlike Post
exports.likeAndUnlikePost = catchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorHandler("Post Not Found", 404));
  }

  if (post.likes.includes(req.user._id)) {
    const index = post.likes.indexOf(req.user._id);
    post.likes.splice(index, 1);
    await post.save();
    return res.status(200).json({
      success: true,
      post,
    });
  }
  post.likes.push(req.user.id);
  await post.save();
  return res.status(200).json({
    success: true,
    post,
  });
});

// Update Caption and Description
exports.updatePost = catchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorHandler("Post Not Found", 404));
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized", 401));
  }

  const updatePost = {
    caption: req.body.caption,
  };

  const Newpost = await Post.findByIdAndUpdate(req.params.id, updatePost, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  return res.status(200).json({
    success: true,
    posts: Newpost,
  });
});

// Create Comment
exports.addComment = catchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate("owner")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        options: { strictPopulate: false },
      },
    });
  if (!post) {
    return next(new ErrorHandler("Post Not Found", 404));
  }

  const newComment = {
    post: req.params.id,
    user: req.user._id,
    comment: "",
    image: "",
  };
  if (req.body.comment) {
    newComment.comment = req.body.comment;
  }
  if (req.body.image) {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: "comments",
    });
    newComment.image = result.secure_url;
  }

  const comment = await Comment.create(newComment);
  if (comment) {
    post.comments.push(comment._id);
  }
  await post.save();
  const newPost = await Post.findById(req.params.id)
    .sort({ comments: -1 })
    .populate("owner")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        options: { strictPopulate: false },
      },
    });
  return res.status(200).json({
    success: true,
    message: "Comment Added",
    post: newPost,
  });
});

//Update Comment
exports.updateComment = catchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorHandler("Post Not Found", 404));
  }

  let commentIndex = -1;
  post.comments.forEach((item, index) => {
    if (item._id.toString() === req.body.commentId.toString()) {
      commentIndex = index;
    }
  });
  if (commentIndex !== -1) {
    post.comments[commentIndex].comment = req.body.comment;
    post.comments[commentIndex].image = req.body.image;
  }

  await post.save();
  res.status(200).json({
    success: true,
    message: "Comment Updated Successfully",
  });
});

//Delete Comment
exports.deleteComment = catchAsyncError(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (comment.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized", 401));
  } else {
    await Comment.findByIdAndDelete(req.params.id);

    const post = await Post.findById(comment.post);
    const index = post.comments.indexOf(comment._id);
    await post.comments.splice(index, 1);
    await post.save();
  }
  const newPost = await Post.findById(comment.post)
    .populate("owner")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        options: { strictPopulate: false },
      },
    });
  return res.status(200).json({
    success: true,
    message: "Comment Deleted Successfully",
    post: newPost,
  });
});

//Like Comment
exports.likeAndunlikeComment = catchAsyncError(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new ErrorHandler("Comment Not Found", 404));
  }
  if (comment.likes.includes(req.user._id)) {
    const index = comment.likes.indexOf(req.user._id);
    comment.likes.splice(index, 1);
    await comment.save();
    res.status(200).json({
      success: true,
      message: "Comment Unliked.",
    });
  } else {
    comment.likes.push(req.user._id);
    await comment.save();
    res.status(200).json({
      success: true,
      message: "Comment Liked.",
    });
  }
});

// Add A Reply
exports.addReply = catchAsyncError(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new ErrorHandler("Comment Not Found", 404));
  }
  const newReply = {
    user: req.user._id,
    reply: req.body.reply,
  };
  await comment.replies.push(newReply);

  // let commentIndex = -1;
  // post.comments.forEach((item, index) => {
  //   if (item._id.toString() === req.body.commentId.toString()) {
  //     commentIndex = index;
  //   }
  // });

  // if (commentIndex !== -1) {
  //   post.comments[commentIndex].replies.push(newReply);
  // }

  await comment.save();
  let newComment = await Comment.findById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Added Successfully",
    reply: newComment.replies[newComment.replies.length - 1],
  });
});

//Like Reply
exports.likeAndunlikeReply = catchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorHandler("Post Not Found", 404));
  }

  let commentIndex = -1;
  post.comments.forEach((item, index) => {
    if (item._id.toString() === req.body.commentId.toString()) {
      commentIndex = index;
    }
  });

  if (commentIndex !== -1) {
    let replyIndex = -1;
    post.comments[commentIndex].replies.forEach((item, index) => {
      if (item._id.toString() === req.body.replyId.toString()) {
        replyIndex = index;
      }
    });

    if (replyIndex !== -1) {
      if (
        post.comments[commentIndex].replies[replyIndex].likes.includes(
          req.user._id
        )
      ) {
        const index = post.comments[commentIndex].replies[
          replyIndex
        ].likes.indexOf(req.user._id);
        post.comments[commentIndex].replies[replyIndex].likes.splice(index, 1);
        await post.save();
        return res.status(200).json({
          success: true,
          message: "Reply Unliked",
        });
      }

      post.comments[commentIndex].replies[replyIndex].likes.push(req.user._id);
      await post.save();

      return res.status(200).json({
        success: true,
        message: "Reply Liked",
      });
    }
  }
});

//Delete Reply
exports.deleteReply = catchAsyncError(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new ErrorHandler("Comment Not Found", 404));
  }
  let index = -1;
  comment.replies.forEach((val, ind) => {
    if (val._id.toString() == req.body.replyId.toString()) {
      index = ind;
    }
  });

  if (index > -1) {
    comment.replies.splice(index, 1);
    await comment.save();
    res.status(200).json({
      success: true,
      message: "Reply Deleted Successfully",
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Reply Not Found",
    });
  }
});

//Update Reply
exports.updateReply = catchAsyncError(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorHandler("Post Not Found", 404));
  }

  let commentIndex = -1;
  post.comments.forEach((item, index) => {
    if (item._id.toString() === req.body.commentId.toString()) {
      commentIndex = index;
    }
  });
  if (commentIndex !== -1) {
    post.comments[commentIndex].replies.forEach((item, index) => {
      if (item.user._id.toString() === req.user._id.toString()) {
        if (item._id.toString() === req.body.replyId.toString()) {
          post.comments[commentIndex].replies[index].reply = req.body.reply;
          post.comments[commentIndex].replies[index].image = req.body.image;
        }
      }
    });
  }

  await post.save();
  res.status(200).json({
    success: true,
    message: "Reply Updated Successfully",
  });
});

//Get User Post  ---Developer
exports.getMyPost = catchAsyncError(async (req, res, next) => {
  const userPost = await Post.find({ owner: req.user._id });

  // const userPosts = await user.populate("posts");
  res.status(200).json({
    success: true,
    posts: userPost,
  });
});
