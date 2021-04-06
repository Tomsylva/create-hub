const router = require("express").Router();
//maybe
/* GET home page */
router.get("/", (req, res, next) => {
  let user;
  if (req.session.user) {
    user = req.session.user;
  }
  res.render("index", { user });
});

module.exports = router;
