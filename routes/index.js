const router = require("express").Router();
//maybe
/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

module.exports = router;
