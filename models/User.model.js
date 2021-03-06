const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  bio: {
    type: String,
  },
  interests: [
    {
      type: Schema.Types.ObjectId,
      ref: "Community",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = model("User", userSchema);

module.exports = User;
