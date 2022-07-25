const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/auth')
const Post = require("../models/Post");

//  @Route POST api/posts
//  @desc Create a new post
// @@ access Private

router.post("/", verifyToken ,async (req, res) => {
  const { title, description, url, status } = req.body;

  //   Simple validatiton
  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
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
    res.json({
      success: true,
      message: "Post saved successfully",
      post: newPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal error" });
  }
});

module.exports = router