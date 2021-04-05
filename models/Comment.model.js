const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const commentSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String, //CONNECT A USER
  },
  likes: {
    type: Number,
    default: 0,
  },
});

const Comment = model("Comment", commentSchema);

module.exports = Comment;
