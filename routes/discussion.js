const express = require("express");
const parser = require("../config/cloudinary");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const isMember = require("../middlewares/isMember");
const User = require("../models/User.model");
const Community = require("../models/Community.model");
const Discussion = require("../models/Discussion.model");
const Comment = require("../models/Comment.model");
const moment = require("moment");
// LINK FROM "START A CONVERSATION" BUTTON
// Finds correct community and passes it with req-params and slug
router.get(
  "/:dynamicCommunity/new-discussion",
  isLoggedIn,
  isMember,
  (req, res) => {
    Community.findOne({ slug: req.params.dynamicCommunity })
      .populate("members")
      .then((singleCommunity) => {
        if (!singleCommunity) {
          return res.redirect("/");
        }
        // if (/* USER ID IS NOT IN ARRAY OF MEMBERS */){
        //   res.redirect(`/${req.params.dynamicCommunity}`)
        // }
        res.render("community/new-discussion", {
          singleCommunity: singleCommunity,
          user: req.session.user._id,
        });
      });
  }
);

// CREATES A NEW DISCUSSION IF ONE DOESN'T EXIST
router.post(
  "/:dynamicCommunity/new-discussion",
  isLoggedIn,
  parser.single("image"),
  (req, res) => {
    const dynamicCommunity = req.params.dynamicCommunity;
    const { title, firstPost } = req.body;
    const image = req.file?.path;
    const formattedTime = moment().format("MMMM Do YYYY, h:mm");
    if (!title || !firstPost) {
      return res.render("community/new-discussion", {
        errorMessage: "Please fill in both fields",
        user: req.session.user._id,
      });
    }
    Discussion.findOne({ title })
      .populate("User")
      .populate("date")
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
          formattedTime,
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
      .populate("comments")
      .then((singleCommunity) => {
        Discussion.findOne({ _id: req.params.dynamicDiscussion }).then(
          (singleDiscussion) => {
            res.render("community/discussion", {
              community: singleCommunity,
              discussion: singleDiscussion,
              user: req.session.user,
              comments: singleCommunity.comments,
            });
          }
        );
      });
  }
);
// function discussionExistMiddleware(req, res, next) {
//   Discussion.findById(req.params.dynamicCommunity)
//     .populate("creadtedBy")
//     .populate("members")
//     .then((foundDiscussion) => {
//       if (!foundDiscussion) {
//         return res.redirect("/profile");
//       }
//       req.discussion = foundDiscussion;

//       next();
//     });
// }

//DYNAMIC EDIT THE DISCUSSION
//the body is not being send to edit just yet, also the POST not properly working
router.get(
  "/:dynamicDiscussion/edit-discussion",
  isLoggedIn,
  async (req, res) => {
    try {
      const discussion = await Discussion.findOne({
        _id: req.params.dynamicDiscussion,
      }).lean();
      if (!discussion) {
        return res.redirect("/");
      }
      if (discussion.user != req.user.id) {
        res.redirect("/community");
      } else {
        res.render("community/edit-discussion", {
          discussion,
          user: req.session.user,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
);

router.post(
  "/:dynamicDiscussion/edit-discussion",
  isLoggedIn,
  parser.single("image"),
  async (req, res) => {
    console.log("LOOOK HERE MY FRIEND", req.params.dynamicDiscussion);
    await Discussion.findById(req.params.dynamicDiscussion);
    const { title, firstPost } = req.body;
    const image = req.file?.path;

    console.log("HELLOOOOO");

    const toClean = { title, firstPost, image };

    const updateDiscussion = Object.fromEntries(
      Object.entries(toClean).filter((el) => el[1])
    );

    await Discussion.findByIdAndUpdate(
      req.params.dynamicDiscussion,
      updateDiscussion,
      {
        new: true,
      }
    ).then((newDiscu) => {
      console.log("newDiscu", newDiscu);
      req.session.discussion = newDiscu;
      res.redirect(`/community/${req.params.dynamicCommunity}`);
    });
  }
);

//DYNAMIC DELATE THE TOPIC
router.get("/:dynamicDiscussion/delete", isLoggedIn, async (req, res) => {
  try {
    const deleteTopic = await Discussion.findById(
      req.params.dynamicDiscussion
    ).populate("createdBy");

    console.log(deleteTopic);
    if (!deleteTopic) {
      return res.redirect("/");
    }
    //ONLY THE CREATOR CAN DELETE
    const isCreator =
      deleteTopic.createdBy._id.toString() === req.session.user._id.toString();
    if (!isCreator) {
      return res.redirect("/");
    }
    Discussion.findByIdAndDelete(deleteTopic._id).then(() => {
      Community.findOneAndUpdate(
        { discussionTopics: { $in: deleteTopic._id } },
        {
          $pull: { topic: deleteTopic._id },
        }
      ).then((community) => {
        // res.render / res.redirect cannot take dynamic values, like the params
        // res.redirect(`/community/${a variable}`)
        // return res.redirect("/community/:dynamicCommunity");
        res.redirect(`/community/${community._id}`);
      });
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;

// try {
//   let discussion = await Discussion.findById(
//     req.params.dynamicDiscussion
//   ).lean();

//   if (discussion.user != req.user.id) {
//     return res.redirect("/");
//   } else {
//     discussion = await Discussion.findOneAndUpdate(
//       { _id: req.params.dynamicDiscussion },
//       req.body,
//       {
//         new: true,
//       }
//     );
//     return res.redirect("/community");
//   }
// } catch (err) {
//   console.log(err);
// }
