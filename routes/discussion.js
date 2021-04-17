const express = require("express");
const parser = require("../config/cloudinary");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const isMember = require("../middlewares/isMember");
const User = require("../models/User.model");
const Community = require("../models/Community.model");
const Discussion = require("../models/Discussion.model");
const Comment = require("../models/Comment.model");

// LINK FROM "START A CONVERSATION" BUTTON
// Finds correct community and passes it with req-params and slug
router.get(
  "/:dynamicCommunity/new-discussion",
  isLoggedIn,
  // isMember,
  (req, res) => {
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
  }
);

// CREATES A NEW DISCUSSION IF ONE DOESN'T EXIST
router.post(
  "/:dynamicCommunity/new-discussion",
  isLoggedIn,
  parser.single("image"),
  async (req, res) => {
    // try {
    //   req.firstPost.user = req.user._id;
    //   console.log(req.firstPost);
    //   const discussion = await Discussion.create(req.firstPost);
    //   res.redirect("/:dynamicCommunity");
    // } catch (err) {
    //   console.log(err);
    // }
    const dynamicCommunity = req.params.dynamicCommunity;
    const { title, firstPost } = req.body;
    const image = req.file?.path;

    if (!title || !firstPost) {
      return res.render("community/new-discussion", {
        errorMessage: "Please fill in both fields",
        user: req.session.user._id,
      });
    }
    Discussion.findOne({ title })
      .populate("User")
      .then((found) => {
        // if (!found) {
        //   return res.redirect("/");
        // }
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

module.exports = router;

// const toClean = { title, firstPost, image };
//     const updater = Object.fromEntries(
//       Object.entries(toClean).filter((el) => el[1]) //filter out everything that doesnt have a first position truthy
//     );
//     console.log("LOOK HERE NOW", req.session);

//     Discussion.findByIdAndUpdate(req.session.user._id, updater, {
//       new: true,
//     }).then((newDiscussion) => {
//       req.session.createdBy = newDiscussion;
//       // res.redirect("/:dynamicCommunity/new-discussion");
//       return res.redirect("/");
//     });
