const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    // name email pwd  pic
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile_pic: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/thumbnails/020/717/950/small/human-bust-silhouette-avatar-bust-shape-parallel-lines-human-chakra-aura-radiation-of-energy-vector.jpg",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
