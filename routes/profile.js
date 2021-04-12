const express = require("express");
const parser = require("../config/cloudinary");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const User = require("../models/User.model");
const Community = require("../models/Community.model");
const Discussion = require("../models/Discussion.model");
const Comment = require("../models/Comment.model");

router.get("/", isLoggedIn, (req, res) => {
  console.log("req.session.user", req.session.user);
  res.render("profile", { user: req.session.user });
});

router.get("/edit", isLoggedIn, (req, res) => {
  res.render("edit-profile", { user: req.session.user });
});

router.post("/edit", isLoggedIn, parser.single("image"), (req, res) => {
  const { name, bio, interests } = req.body;
  const userImage = req.file.path;
  User.findByIdAndUpdate(
    req.session.user._id,
    { name, interests, bio, userImage },
    { new: true }
  ).then((newUser) => {
    console.log("newUser:", newUser);
    req.session.user = newUser;
    res.redirect("/profile");
  });
});
router.get("/delete", isLoggedIn, async (req, res) => {
  const userId = req.session.user._id;

  // Delete the user document in the users collection
  await User.findByIdAndDelete(userId);

  // list all of the users communities -> needs to be checked whenever you merge code with tom
  const allUserCommunities = await Community.find({
    members: { $in: userId },
  }); // will return a list of all the communities that the user was a part of

  // assuming the code above is correct, this edits ALL of the communities removing the user
  const updatedCommunities = allUserCommunities.map((community) => {
    return Community.findByIdAndUpdate(community._id, {
      $pop: { members: userId },
    });
  });
  // making sure every promise runes
  await Promise.all(updatedCommunities); // we are removing the user from the communities

  // List all of the users created discussions
  const allUserDiscussions = await Discussion.find({ createdBy: userId });

  // delete every single discussion that user created
  const deleteAllDiscussions = allUserDiscussions.map((el) =>
    Discussion.findByIdAndDelete(el._id)
  );
  // const commentsArray = allUserDiscussions.map(el => el.comments) // WHENEVER WE ARE READY TO DELETE COMMENTS WE START HERE
  // Deletes all of the discussions created By the user
  await Promise.all(deleteAllDiscussions);
  // update the session in the database removing the user from there
  req.session.user = null;

  // completely remove the cookie from the browser
  res.clearCookie("connect.sid");
  return res.redirect("/");
  // Andre will research this again -> BULK DELETE ALL OF THE SESSIONS BY THE USER
  // const allUserComments = await Comment.find({$or:[{createdBy: userId}]})

  //   const deleteAllPromises = allUserComments.map(el => Comment.findByIdAndDelete(el._id))
  // await Promise.all(deleteAllPromises)
});

module.exports = router;
