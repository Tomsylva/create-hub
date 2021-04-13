const router = require("express").Router();
const Community = require("../models/Community.model");
const User = require("../models/User.model");
const Discussion = require("../models/Discussion.model");
const isLoggedIn = require("../middlewares/isLoggedIn");
const apiURL = `http://api.mediastack.com/v1/news?access_key=${process.env.NEWS_API_KEY}`;
const axios = require("axios");
const parser = require("../config/cloudinary");
//let apidata;

router.get("/", (req, res) => {
  res.render("community/community-home", { user: req.session.user._id });
});

// JOIN A COMMUNITY SPACE
router.get("/:dynamicCommunity/join", isLoggedIn, async (req, res) => {
  const singleCommunity = await Community.findOneAndUpdate(
    {
      slug: req.params.dynamicCommunity,
    },
    { $addToSet: { members: req.session.user._id } }
  ).populate("members");

  await User.findByIdAndUpdate(req.session.user._id, {
    $addToSet: { interests: singleCommunity._id },
  });
  res.render("community/community-joined", {
    activeSlug: req.params.dynamicCommunity,
    user: req.session.user._id,
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
        user: req.session.user._id,
      });
    }
  );
});

// CREATES A NEW DISCUSSION IF ONE DOESN'T EXIST
router.post(
  "/:dynamicCommunity/new-discussion",
  isLoggedIn,
  parser.single("image"),
  (req, res) => {
    const dynamicCommunity = req.params.dynamicCommunity;
    const { title, firstPost } = req.body;
    const image = req.file.path;
    if (!title || !firstPost) {
      res.render("community/new-discussion", {
        errorMessage: "Please fill in both fields",
        user: req.session.user._id,
      });
      return;
    }
    Discussion.findOne({ title })
      .populate("User")
      .then((found) => {
        if (!found) {
          return res.redirect("/");
        }
        if (found) {
          return res.render("community/new-discussion", {
            errorMessage: "Discussion already exists",
            user: req.session.user._id,
          });
        }
        Discussion.create({
          title,
          firstPost,
          image,
          createdBy: req.session.user._id,
        })
          .then((createdDiscussion) => {
            console.log("Amazing! Created discussion", createdDiscussion);
            Community.findOneAndUpdate(
              { slug: dynamicCommunity },
              { $addToSet: { discussionTopics: createdDiscussion._id } },
              { new: true }
            ).then((updatedCommunity) => {
              console.log("Updated comunnity", updatedCommunity);
              res.redirect(`/community/${req.params.dynamicCommunity}`);
            });
          })
          .catch((err) => {
            console.log("Sad times :(", err);
            res.render("community/new-discussion", {
              errorMessage: "Something went wrong",
              user: req.session.user._id,
            });
          });
      });
  }
);

// LOADS DISCUSSION PAGE DYNAMICALLY - not yet working
router.get(
  "/:dynamicCommunity/discussion/:dynamicDiscussion",
  isLoggedIn,
  (req, res) => {
    Community.findOne({ slug: req.params.dynamicCommunity })
      .populate("discussionTopics")
      .then((singleCommunity) => {
        Discussion.findOne({ _id: req.params.dynamicDiscussion }).then(
          (singleDiscussion) => {
            res.render("community/discussion", {
              community: singleCommunity,
              discussion: singleDiscussion,
            });
          }
        );
      });
  }
);

// MAKING COMMENTS - not yet working
// router.post(
//   "/:dynamicCommunity/discussion/:dynamicDiscussion/comment",
//   isLoggedIn,
//   (req, res) => {
//     Community.findOne({ slug: req.params.dynamicCommunity })
//       .populate("discussionTopics")
//       .then((singleCommunity) => {
//         Discussion.findById(req.params.dynamicDiscussion).then(
//           (singleDiscussion) => {
//             const { title, text } = req.body;
//             Comment.create({
//               title,
//               text,
//               createdBy: req.session.user._id,
//             }).then((newComment) => {
//               console.log(newComment);
//               res.redirect(`/community/${singleCommunity.slug}`);
//             });
//           }
//         );
//       });
//   }
// );

// LOADS EACH COMMUNITY HOME DYNAMICALLY
// Each community can be viewed by anybody not signed in
router.get("/:dynamicCommunity", (req, res) => {
  Community.findOne({ slug: req.params.dynamicCommunity })
    .populate("discussionTopics")
    .then((singleCommunity) => {
      if (!singleCommunity) {
        return res.redirect("/");
      }
      let keyword = singleCommunity.keyword;
      let discussions = singleCommunity.discussionTopics;
      getNewsStories(keyword).then((apidata) => {
        res.render("community/single-community", {
          singleCommunity: singleCommunity,
          apidata: apidata,
          user: req.session.user._id,
          discussions: discussions,
        });
      });
    });
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
