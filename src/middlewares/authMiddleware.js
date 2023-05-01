const UserModel = require("../models/users/user.model");

const jwt = require("jsonwebtoken");

const protectRoute = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const the_decoded_user = await UserModel.findById(decoded.id).select(
        "-password"
      );
      req.user = {
        _id: the_decoded_user._id,
        email: the_decoded_user.email,
        name: the_decoded_user.name,
        profile_pic: the_decoded_user.profile_pic,
      };
      req.isAuth = true;
    } catch (err) {
      req.user = null;
      req.isAuth = false;
      return res
        .status(403)
        .json({ msg: "Not AUTHORIZED-NO TOKEN....", type: "NO_TOKEN" });
    }
    return next();
  }
  req.user = null;
  req.isAuth = false;
  return res
    .status(403)
    .json({ msg: "Not AUTHORIZED-NO TOKEN....", type: "NO_TOKEN" });
};
module.exports = { protectRoute };
