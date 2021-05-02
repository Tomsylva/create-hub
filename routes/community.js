const router = require("express").Router();
const Community = require("../models/Community.model");
const User = require("../models/User.model");
const Discussion = require("../models/Discussion.model");
const isLoggedIn = require("../middlewares/isLoggedIn");
const apiURL = `http://api.mediastack.com/v1/news?access_key=${process.env.NEWS_API_KEY}`;
const axios = require("axios");
const parser = require("../config/cloudinary");
const Comment = require("../models/Comment.model");
const isMember = require("../middlewares/isMember");
//let apidata;
const moment = require("moment");

router.get("/", (req, res) => {
  res.render("community/community-home", { user: req.session.user?._id });
});

// JOIN A COMMUNITY SPACE
router.get("/:dynamicCommunity/join", isLoggedIn, async (req, res) => {
  const member = await Community.find({ members: req.session.user._id });
  const singleCommunity = await Community.findOneAndUpdate(
    {
      slug: req.params.dynamicCommunity,
    },
    { $addToSet: { members: req.session.user._id } }
  ).populate("members");
  const isMember = singleCommunity.members.find(
    (user) => user.username === req.session.user.username
  );
  if (isMember) {
    return res.redirect("community/single-community");
  }
  await User.findByIdAndUpdate(req.session.user._id, {
    $addToSet: { interests: singleCommunity._id },
  });
  res.render("community/community-joined", {
    members: member,
    activeSlug: req.params.dynamicCommunity,
    user: req.session.user._id,
  });
});

//COMMENTS, COMMENTS, COMMENTS!!!
router.post(
  "/:dynamicCommunity/discussion/:dynamicDiscussion",
  isLoggedIn,
  async (req, res) => {
    try {
      const { text } = req.body;
      const community = await Community.findOne({
        slug: req.params.dynamicCommunity,
      })
        .populate("discussionTopics")
        .populate("createdBy");
      const discussion = await Discussion.findById(
        req.params.dynamicDiscussion
      ).populate("createdBy");

      const createdComment = await Comment.create({
        text,
        createdBy: req.session.user._id,
      });
      await Discussion.findByIdAndUpdate(
        req.params.dynamicDiscussion,
        { $addToSet: { comments: createdComment._id } },
        { new: true }
      );
      return res.redirect(
        `/community/${community.slug}/discussion/${discussion._id}`
      );
    } catch (err) {
      console.log(err);
    }
  }
);

// LOADS EACH COMMUNITY HOME DYNAMICALLY
// Each community can be viewed by anybody not signed in
router.get("/:dynamicCommunity", async (req, res) => {
  const singleCommunity = await Community.findOne({
    slug: req.params.dynamicCommunity,
  })
    .populate("discussionTopics")
    .populate("members");

  // const isCommunityMember = await singleCommunity.members.includes(
  //   req.session.user._id
  // );

  if (!singleCommunity) {
    return res.redirect("/");
  }
  let keyword = singleCommunity.keyword;

  let discussions = singleCommunity.discussionTopics.map((e) => {
    return {
      ...e.toJSON(), // in normal JS this does not exist. .toJSON exists in mongoose documentes.
      date: moment(e.date).format("LL"),
    };
  });

  getNewsStories(keyword).then((apidata) => {
    res.render("community/single-community", {
      singleCommunity: singleCommunity,
      apidata: apidata,
      user: req.session.user?.name,
      discussions: discussions,
      // isCommunityMember: isCommunityMember,
    });
  });
});

//});

function getNewsStories(keyword) {
  return axios
    .get(`${apiURL}&keywords=${keyword}&languages=en`)
    .then((response) => {
      // console.log(response.data.data[0]);
      return response.data.data;
    });
}

module.exports = router;
