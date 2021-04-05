const router = require("express").Router();
const Community = require("../models/Community.model");

router.get("/", (req, res) => {
  res.render("community/community-home");
});

module.exports = router;
