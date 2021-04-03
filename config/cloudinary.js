const cloudinary = require("cloudinary").v2;
const multer = requiere("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "test-for-class",
  },
});
const parser = multer({ storage });

module.exports = parser;
