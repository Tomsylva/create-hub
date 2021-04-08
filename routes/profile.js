const express = require("express");
const parser = require("../config/cloudinary");
const router = express.Router();
const login = require("../middlewares/isLoggedIn");
const User = require("../models/User.model");
const passport = require("passport");
//google
router.get(
  "/google",
  login,
  passport.authenticate("google", { scope: ["profile"] })
);
router.get(
  "/google/callback",
  login,
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);
router.get("/", login, (req, res) => {
  console.log("req.session.user", req.session.user);
  res.render("profile", { user: req.session.user });
});

router.get("/edit", login, (req, res) => {
  res.render("edit-profile", { user: req.session.user });
});

router.post("/edit", login, parser.single("image"), (req, res) => {
  const { name, bio, interests, userImage } = req.body;

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

module.exports = router;
