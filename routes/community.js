const router = require("express").Router();

router.get("/", (req, res) => {
  res.render("community/community-home");
});

module.exports = router;
