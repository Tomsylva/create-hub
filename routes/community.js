const router = require("express").Router();
const Community = require("../models/Community.model");
const Discussion = require("../models/Discussion.model");
const isLoggedIn = require("../middlewares/isLoggedIn");

router.get("/", (req, res) => {
  res.render("community/community-home");
});

// LINK FROM "START A CONVERSATION" BUTTON
// Finds correct community and passes it with req-params and slug
router.get("/:dynamicCommunity/new-discussion", isLoggedIn, (req, res) => {
  Community.findOne({ slug: req.params.dynamicCommunity }).then(
    (singleCommunity) => {
      if (!singleCommunity) {
        return res.redirect("/");
      }
      res.render("community/new-discussion", {
        singleCommunity: singleCommunity,
      });
    }
  );
});

// CREATES A NEW DISCUSSION IF ONE DOESN'T EXIST
// Add logged in middleware when available !!!!!
router.post("/:dynamicCommunity/new-discussion", isLoggedIn, (req, res) => {
  const dynamicCommunity = req.params.dynamicCommunity;
  const { title, firstPost } = req.body;
  if (!title || !firstPost) {
    res.render("community/new-discussion", {
      errorMessage: "Please fill in both fields",
    });
    return;
  }
  Discussion.findOne({ title }).then((found) => {
    if (found) {
      return res.render("community/new-discussion", {
        errorMessage: "Discussion already exists",
      });
    }
    Discussion.create({
      title,
      firstPost,
      createdBy: req.session.user._id,
    })
      .then((createdDiscussion) => {
        // CURRENTLY REDIRECTS TO COMMUNITY HOME
        console.log("Amazing!");
        res.redirect(`/${dynamicCommunity}`);
      })
      .catch((err) => {
        console.log("Sad times :(", err);
        res.render("community/new-discussion", {
          errorMessage: "Something went wrong",
        });
      });
  });
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
