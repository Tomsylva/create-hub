const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const discussionSchema = new Schema({
  title: {
    type: String,
    unique: true,
    required: true,
  },
  createdBy: {
    type: String, //CONNECT A USER
  },
  comments: {
    type: [String], //CONNECT COMMENTS
  },
  numberOfComments: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    required: true,
  },
});

const Discussion = model("Discussion", discussionSchema);

module.exports = Discussion;
