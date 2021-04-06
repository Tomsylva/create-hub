const { Schema, model } = require("mongoose");

const communitySchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  members: {
    type: [String], //CONNECT USERS
  },
  slug: {
    type: String,
  },
  numberOfMembers: {
    type: Number,
  },
  discussionTopics: {
    type: [String], //CONNECT DISCUSSION TOPICS
  },
  comments: {
    type: [String], //CONNECT COMMENTS
  },
  keyword: {
    type: String,
  },
});

const Community = model("Community", communitySchema);

module.exports = Community;
