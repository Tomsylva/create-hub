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
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  slug: {
    type: String,
  },
  numberOfMembers: {
    type: Number,
  },
  discussionTopics: [{ type: Schema.Types.ObjectId, ref: "Discussion" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  keyword: {
    type: String,
  },
});

const Community = model("Community", communitySchema);

module.exports = Community;
