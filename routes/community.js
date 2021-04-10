const router = require("express").Router();
const Community = require("../models/Community.model");
const User = require("../models/User.model");
const Discussion = require("../models/Discussion.model");
const isLoggedIn = require("../middlewares/isLoggedIn");
const apiURL = `http://api.mediastack.com/v1/news?access_key=${process.env.NEWS_API_KEY}`;
const axios = require("axios");

//let apidata;

router.get("/", (req, res) => {
  res.render("community/community-home");
});

// JOIN A COMMUNITY SPACE
router.get("/:dynamicCommunity/join", isLoggedIn, async (req, res) => {
  const singleCommunity = await Community.findOne({
    slug: req.params.dynamicCommunity,
  }).populate("members");

  singleCommunity.update({ $addToSet: { members: req.session.user._id } });

  // STILL NEEDS TO UPDATE
  const singleUser = await User.findById(req.session.user_id).populate(
    "interests"
  );
  // singleUser.update({ $addToSet: { interests: singleCommunity._id } });
  res.render("community/community-joined", {
    activeSlug: req.params.dynamicCommunity,
  });
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
// CCURRENTLY REDIRECTS CORRECTLY HOWEVER DOES NOT PUSH TO COMMUNITY DISCUSSION TOPIC ARRAY
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
        console.log("Amazing!");
        Community.findOne({
          slug: dynamicCommunity,
        }).then((currentCommunity) => {
          currentCommunity.update({
            $addToSet: { discussionTopics: createdDiscussion._id },
          });
        });
        res.redirect(`/community/${req.params.dynamicCommunity}`);
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
      let keyword = singleCommunity.keyword;
      getNewsStories(keyword).then((apidata) => {
        res.render("community/single-community", {
          singleCommunity: singleCommunity,
          apidata: apidata,
        });
      });
    }
  );
});

function getNewsStories(keyword) {
  return axios
    .get(`${apiURL}&keywords=${keyword}&languages=en`)
    .then((response) => {
      // console.log(response.data.data[0]);
      return response.data.data;
    });
}

module.exports = router;
