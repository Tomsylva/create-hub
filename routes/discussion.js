const express = require("express");
const parser = require("../config/cloudinary");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const User = require("../models/User.model");
const Community = require("../models/Community.model");
const Discussion = require("../models/Discussion.model");
const Comment = require("../models/Comment.model");

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
    const image = req.file?.path;

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
//DYNAMIC EDIT THE DISCUSSION
//the body is not being send to edit just yet, also the POST not properly working
router.get("/:dynamicDiscussion/edit-discussion", isLoggedIn, (req, res) => {
  res.render("community/edit-discussion", {
    discussion: req.session.user._id,
  });
});

router.post(
  "/:dynamicDiscussion/edit-discussion",
  isLoggedIn,
  parser.single("image"),
  (req, res) => {
    const { title, firstPost } = req.body;
    const image = req.file?.path;

    console.log("HELLOOOOO");

    const toClean = { title, firstPost, image };

    const updateDiscussion = Object.fromEntries(
      Object.entries(toClean).filter((el) => el[1])
    );

    Discussion.findByIdAndUpdate(req.session.user._id, updateDiscussion, {
      new: true,
    }).then((newDiscu) => {
      console.log("newDiscu", newDiscu);
      req.session.discussion = newDiscu;
      res.redirect("/community");
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
