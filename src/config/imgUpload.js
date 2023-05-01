const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });
//CLOUDINARY.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME /*|| "dns0lkiu6"*/,
  api_key: process.env.CLOUDINARY_API_KEY /*|| "969359126214134"*/,
  api_secret:
    process.env.CLOUDINARY_API_SECRET /*|| "ze78qciGLjul-9LkDCVky0q37aE"*/,
});
//
//   .then((result) => {
//     console.log(result, "..........result from uploading.........");
//     return res.json({ result });
//   })
//   .catch((err) => {
//     console.log(err, "........error uploading to cloudinary.......");
//   });
const uploadImg = async (path) => {
  try {
    const uploadedImg = await cloudinary.uploader.upload(path, {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });
    return [null, uploadedImg];
  } catch (err) {
    return [err, null];
  }
};
module.exports = { upload, uploadImg };
