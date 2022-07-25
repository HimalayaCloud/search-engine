const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const Post = require("../models/Post");

//  @route POST api/posts
//  @desc Create a new post
//  @access Private

router.post("/", verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body;

  // simple validation
  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "title is required" });
  }

  try {
    const newPost = new Post({
      title,
      description,
      url: url.startsWith("https://") ? url : `https://${url}`,
      status: status || "TO LEARN",
      user: req.userId,
    });

    await newPost.save();

    res.json({ success: true, message: "Happy learning!", post: newPost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: " Internal Server Error" });
  }
});

//  @route GET api/posts
//  @desc GET post
//  @access Private

router.get("/", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.userId }).populate("user", [
      "username",
    ]);
    res.json({ success: true, posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: " Internal Server Error" });
  }
});

//  @route PUT api/posts
//  @desc Update post
//  @access Private

router.put("/:id", verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body;
  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "title is required" });
  }

  try {
    let updatedPost = {
      title,
      description: description || "",
      url: (url.startsWith("https://") ? url : `https://${url}`) || "",
      status: status || "TO LEARN",
    };

    const postUpdateCondition = { _id: req.params.id, user: req.userId };
    updatedPost = await Post.findOneAndUpdate(
      postUpdateCondition,
      updatedPost,
      { new: true }
    );

    // User not authorized to update post
    if (!updatedPost) {
      return res.status(401).json({
        success: false,
        message: "Post not found or user is not authorized",
      });
    }
    // All good

    res.json({
      success: true,
      message: "Excellent Progress",
      post: updatedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: " Internal Server Error" });
  }
});

//  @route Delete api/posts
//  @desc Delete post
//  @access Private

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const postDeleteCondition = { _id: req.params.id, user: req.userId };
    const deletedPost = await Post.findOneAndDelete(postDeleteCondition);

    // User not authorized to delete post
    if (!deletedPost) {
      return res.status(401).json({
        success: false,
        message: "Post not found or user is not authorized",
      });
    }
// All Good
    res.json({success: true, message: "post deleted successfully", post: deletedPost});
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: " Internal Server Error" });
  }
});

module.exports = router;
