const router = require("express").Router();
const Community = require("../models/Community.model");

router.get("/", (req, res) => {
  res.render("community/community-home");
});

// LOADS EACH COMMUNITY HOME DYNAMICALLY
// Each community can be viewed by anybody not signed in
router.get("/:dynamicCommunity", (req, res) => {
  Community.findOne({ slug: req.params.dynamicCommunity }).then(
    (singleCommunity) => {
      if (!singleCommunity) {
        return res.redirect("/");
      }
      res.render("community/single-community", {
        singleCommunity: singleCommunity,
      });
    }
  );
});

module.exports = router;
