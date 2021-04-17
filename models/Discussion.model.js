const { Schema, model } = require("mongoose");

const discussionSchema = new Schema({
  title: {
    type: String,
    unique: true,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  firstPost: {
    type: String,
    required: true,
  },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  numberOfComments: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  image: {
    type: String,
  },
});

const Discussion = model("Discussion", discussionSchema);

module.exports = Discussion;
