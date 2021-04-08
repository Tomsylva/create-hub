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
  interests: {
    type: String,
    enum: [
      "Music",
      "Fine Art",
      "Digital Art",
      "Writing & Poetry",
      "Photography",
    ],
  },
  id: { type: String },

  googleId: {
    type: String,
    //   required: true,
  },
  // displayName: {
  //   type: String,
  //   required: true,
  // },
  // firstName: {
  //   type: String,
  //   required: true,
  // },
  // lastName: {
  //   type: String,
  //   required: true,
  // },
  // image: {
  //   type: String,
  // },
});

const User = model("User", userSchema);

module.exports = User;
