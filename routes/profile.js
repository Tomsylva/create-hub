const express = require("express");

const router = express.Router();
const login = require("../middlewares/isLoggedIn");
const User = require("../models/User.model");

router.get("/", login, (req, res) => {
  console.log("req.session.user", req.session.user);
  res.render("profile", { user: req.session.user });
});

router.get("/edit", login, (req, res) => {
  res.render("edit-profile", { user: req.session.user });
});

router.post("/edit", login, (req, res) => {
  const { name, bio, interests } = req.body;

  User.findByIdAndUpdate(
    req.session.user._id,
    { name, interests, bio },
    { new: true }
  ).then((newUser) => {
    console.log("newUser:", newUser);
    req.session.user = newUser;
    res.redirect("/profile");
  });
});

module.exports = router;
