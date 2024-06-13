const catchAsyncError = require("../middlewares/catchAsyncError");
const Question = require("../models/problem-model/stackModel");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorhandler");
const cloudinary = require("cloudinary").v2;
const Answer = require("../models/problem-model/stackAnswerModel");

//Create Problem
exports.createQuestion = catchAsyncError(async (req, res, next) => {
  const newQuestionData = {
    question: req.body.question,
    description: req.body.description,
    tags: req.body.tags,
    owner: req.user,
  };
  const newQuestion = await Question.create(newQuestionData);
  const user = await User.findById(req.user._id);
  user.questions.push(newQuestion._id);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Successfully Question Created",
    questions: newQuestion,
  });
});

//Get All Post
exports.getAllQuestions = catchAsyncError(async (req, res, next) => {
  const questions = await Question.find()
    .sort({ createdAt: -1 })
    .populate("owner");

  res.status(200).json({
    success: true,
    questions: questions,
  });
});

//Single Problem
exports.getQuestion = catchAsyncError(async (req, res, next) => {
  const question = await Question.findById(req.params.id)
    .populate("owner")
    .populate("answers")
    .populate({
      path: "answers",
      populate: {
        path: "user",
        options: { strictPopulate: false },
      },
    });

  if (!question) {
    return next(new ErrorHandler("Question Not found", 401));
  }
  res.status(201).json({
    success: true,
    question,
  });
});

//Delete Problem
exports.deleteQuestion = catchAsyncError(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return next(new ErrorHandler("Question Not Found", 404));
  }

  if (question.owner.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized", 401));
  } else {
    await Question.findByIdAndDelete(req.params.id);

    const user = await User.findById(req.user._id);
    const index = user.questions.indexOf(req.params.id);
    user.questions.splice(index, 1);
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: "Question Successfully Deleted",
  });
});

// // Like and Unlike Question
exports.likeAndUnlikeQuestion = catchAsyncError(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return next(new ErrorHandler("Question Not Found", 404));
  }

  if (question.likes.includes(req.user._id)) {
    const index = question.likes.indexOf(req.user._id);
    question.likes.splice(index, 1);
    await question.save();
    return res.status(200).json({
      success: true,
      question,
    });
  }
  question.likes.push(req.user.id);
  await question.save();
  return res.status(200).json({
    success: true,
    question,
  });
});

// // Update Caption and Description
// exports.updatePost = catchAsyncError(async (req, res, next) => {
//   const post = await Post.findById(req.params.id);
//   if (!post) {
//     return next(new ErrorHandler("Post Not Found", 404));
//   }

//   if (post.owner.toString() !== req.user._id.toString()) {
//     return next(new ErrorHandler("Unauthorized", 401));
//   }

//   const updatePost = {
//     caption: req.body.caption,
//   };

//   const Newpost = await Post.findByIdAndUpdate(req.params.id, updatePost, {
//     new: true,
//     runValidators: true,
//     useFindAndModify: false,
//   });
//   return res.status(200).json({
//     success: true,
//     posts: Newpost,
//   });
// });

// Create Comment
exports.addAnswer = catchAsyncError(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return next(new ErrorHandler("Question Not Found", 404));
  }

  const newAnswer = {
    questionId: req.params.id,
    user: req.user._id,
  };

  if (req.body.answer) {
    newAnswer.answer = req.body.answer;
  }

  const answer = await Answer.create(newAnswer);
  if (answer) {
    question.answers.push(answer._id);
  }
  await question.save();
  const newQuestion = await Question.findById(req.params.id)
    .populate("owner")
    .populate("answers")
    .populate({
      path: "answers",
      populate: {
        path: "user",
        options: { strictPopulate: false },
      },
    });

  return res.status(200).json({
    success: true,
    message: "Answer Added",
    question: newQuestion,
  });
});

// //Update Answer
exports.updateAnswer = catchAsyncError(async (req, res, next) => {
  const answer = await Answer.findById(req.body.answerId);
  if (!answer) {
    return next(new ErrorHandler("Answer Not Found", 404));
  }
  await Answer.findByIdAndUpdate(
    req.body.answerId,
    { answer: req.body.answer },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  await answer.save();
  const newQuestion = await Question.findById(req.params.id)
    .populate("owner")
    .populate("answers")
    .populate({
      path: "answers",
      populate: {
        path: "user",
        options: { strictPopulate: false },
      },
    });

  res.status(200).json({
    success: true,
    message: "Answer Updated Successfully",
    question: newQuestion,
  });
});

// //Delete Answer
exports.deleteAnswer = catchAsyncError(async (req, res, next) => {
  const answer = await Answer.findById(req.body.answerId);
  if (!answer) {
    return next(new ErrorHandler("Answer Not Found", 404));
  } else {
    await Answer.findByIdAndDelete(req.body.answerId);
    const question = await Question.findById(req.params.id);
    const index = await question.answers.indexOf(req.body.answerId);
    question.answers.splice(index, 1);
    await question.save();
    const newQuestion = await Question.findById(req.params.id)
      .populate("owner")
      .populate("answers")
      .populate({
        path: "answers",
        populate: {
          path: "user",
          options: { strictPopulate: false },
        },
      });
    res.status(200).json({
      success: true,
      message: "Answer Deleted Successfully",
      question: newQuestion,
    });
  }
});

//Like Answer
exports.likeAndunlikeAnswer = catchAsyncError(async (req, res, next) => {
  const answer = await Answer.findById(req.params.id);
  if (!answer) {
    return next(new ErrorHandler("Answer Not Found", 404));
  }

  if (answer.likes.includes(req.user._id)) {
    const index = answer.likes.indexOf(req.user._id);
    answer.likes.splice(index, 1);
    await answer.save();
    return res.status(200).json({
      success: true,
      message: "Unliked",
    });
  }
  answer.likes.push(req.user.id);
  await answer.save();
  return res.status(200).json({
    success: true,
    message: "Liked",
    answer,
  });
});

//Like Answer
exports.viewedQuestion = catchAsyncError(async (req, res, next) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    return next(new ErrorHandler("Question Not Found", 404));
  }

  if (!question.views.includes(req.user._id)) {
    question.views.push(req.user._id);
    await question.save();
    return res.status(200).json({
      success: true,
      message: "Viewed",
    });
  } else {
    return res.status(200).json({
      success: true,
      message: "Viewed Recently",
    });
  }
});

// // Add A Reply
// exports.addReply = catchAsyncError(async (req, res, next) => {
//   const comment = await Comment.findById(req.params.id);
//   if (!comment) {
//     return next(new ErrorHandler("Comment Not Found", 404));
//   }
//   const newReply = {
//     user: req.user._id,
//     reply: req.body.reply,
//   };
//   await comment.replies.push(newReply);

//   // let commentIndex = -1;
//   // post.comments.forEach((item, index) => {
//   //   if (item._id.toString() === req.body.commentId.toString()) {
//   //     commentIndex = index;
//   //   }
//   // });

//   // if (commentIndex !== -1) {
//   //   post.comments[commentIndex].replies.push(newReply);
//   // }

//   await comment.save();
//   res.status(200).json({
//     success: true,
//     message: "Added Successfully",
//   });
// });

// //Like Reply
// exports.likeAndunlikeReply = catchAsyncError(async (req, res, next) => {
//   const post = await Post.findById(req.params.id);
//   if (!post) {
//     return next(new ErrorHandler("Post Not Found", 404));
//   }

//   let commentIndex = -1;
//   post.comments.forEach((item, index) => {
//     if (item._id.toString() === req.body.commentId.toString()) {
//       commentIndex = index;
//     }
//   });

//   if (commentIndex !== -1) {
//     let replyIndex = -1;
//     post.comments[commentIndex].replies.forEach((item, index) => {
//       if (item._id.toString() === req.body.replyId.toString()) {
//         replyIndex = index;
//       }
//     });

//     if (replyIndex !== -1) {
//       if (
//         post.comments[commentIndex].replies[replyIndex].likes.includes(
//           req.user._id
//         )
//       ) {
//         const index = post.comments[commentIndex].replies[
//           replyIndex
//         ].likes.indexOf(req.user._id);
//         post.comments[commentIndex].replies[replyIndex].likes.splice(index, 1);
//         await post.save();
//         return res.status(200).json({
//           success: true,
//           message: "Reply Unliked",
//         });
//       }

//       post.comments[commentIndex].replies[replyIndex].likes.push(req.user._id);
//       await post.save();

//       return res.status(200).json({
//         success: true,
//         message: "Reply Liked",
//       });
//     }
//   }
// });

// //Delete Reply
// exports.deleteReply = catchAsyncError(async (req, res, next) => {
//   const comment = await Comment.findById(req.params.id);
//   if (!comment) {
//     return next(new ErrorHandler("Comment Not Found", 404));
//   }
//   let index = -1;
//   comment.replies.forEach((val, ind) => {
//     if (val._id.toString() == req.body.replyId.toString()) {
//       index = ind;
//     }
//   });

//   if (index > -1) {
//     comment.replies.splice(index, 1);
//     await comment.save();
//     res.status(200).json({
//       success: true,
//       message: "Reply Deleted Successfully",
//     });
//   } else {
//     res.status(404).json({
//       success: false,
//       message: "Reply Not Found",
//     });
//   }
// });

// //Update Reply
// exports.updateReply = catchAsyncError(async (req, res, next) => {
//   const post = await Post.findById(req.params.id);
//   if (!post) {
//     return next(new ErrorHandler("Post Not Found", 404));
//   }

//   let commentIndex = -1;
//   post.comments.forEach((item, index) => {
//     if (item._id.toString() === req.body.commentId.toString()) {
//       commentIndex = index;
//     }
//   });
//   if (commentIndex !== -1) {
//     post.comments[commentIndex].replies.forEach((item, index) => {
//       if (item.user._id.toString() === req.user._id.toString()) {
//         if (item._id.toString() === req.body.replyId.toString()) {
//           post.comments[commentIndex].replies[index].reply = req.body.reply;
//           post.comments[commentIndex].replies[index].image = req.body.image;
//         }
//       }
//     });
//   }

//   await post.save();
//   res.status(200).json({
//     success: true,
//     message: "Reply Updated Successfully",
//   });
// });

// //Get User Post  ---Developer
// exports.getMyPost = catchAsyncError(async (req, res, next) => {
//   const userPost = await Post.find({ owner: req.user._id });

//   // const userPosts = await user.populate("posts");
//   res.status(200).json({
//     success: true,
//     posts: userPost,
//   });
// });
