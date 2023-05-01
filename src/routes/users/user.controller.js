const UserModel = require("../../models/users/user.model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../../config/tokens");
const { search } = require("./user.router");
module.exports.RegisterUser = async (req, res) => {
  // name: FirstName LastName
  // email
  // password
  // profile_pic default "https://static.vecteezy.com/system/resources/thumbnails/020/717/950/small/human-bust-silhouette-avatar-bust-shape-parallel-lines-human-chakra-aura-radiation-of-energy-vector.jpg",
  const {
    firstName,
    lastName,
    email,
    password,
    profile_pic = undefined,
  } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      err: true,
      msg: "Please Enter All Fields!",
      type: "MISSING_FIELDS",
    });
  }
  if (password.trim().length < 6) {
    return res.status(400).json({
      err: true,
      msg: "Please Use a long and more secure password",
      type: "BAD_PASSWORD",
    });
  }
  const userExists = await UserModel.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      err: true,
      msg: "User Already Exists",
      type: "USER_EXISTS",
      userExists,
    });
  }
  const name = `${firstName} ${lastName}`;

  const hashedPassword = await bcrypt.hash(password, 10).catch((err) => {
    return res.status(500).json({
      err: true,
      msg: "ERROR HASHING PASSWORD",
      type: "HASHING_PASSWORD",
      the_error: err,
    });
  });
  const createdUser = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    // password,
    profile_pic,
  }).catch((error) => {
    return res.status(500).json({
      err: true,
      msg: "Error Creating User",
      true_err: error.message,
      type: "ERROR_ADDING_DB",
    });
  });
  if (createdUser) {
    return res.status(201).json({
      user: {
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        profile_pic: createdUser.profile_pic,
      },
      token: generateToken(createdUser._id),
    });
  }
};
module.exports.LoginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body, "......req.body...");
  if (!email || !password) {
    return res.status(400).json({
      err: true,
      msg: "Please enter all required fields...",
      type: "MISSING_FIELDS",
    });
  }
  const the_user = await UserModel.findOne({ email });
  if (!the_user) {
    return res.status(400).json({
      err: true,
      msg: "uSER DOES NOT EXIST",
      type: "NO_EXISTENT_USER",
    });
  }
  const isMatch = await bcrypt.compare(password, the_user.password);
  // return res.json({ isMatch, the_user,token:generateToken(the_user._id)});
  if (isMatch) {
    return res.status(200).json({
      user: {
        _id: the_user._id,
        email: the_user.email,
        name: the_user.name,
        profile_pic: the_user.profile_pic,
      },
      token: generateToken(the_user._id),
    });
  }
  return res.status(401).json({ msg: "LOG IN FAILED" });
};
module.exports.getAllSearchUsers = async (req, res) => {
  const { search } = req.query;
  const keyword = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const search_users = await UserModel.find(keyword)
    .find({
      _id: { $ne: req.user._id },
    })
    .select("-password");
  return res.json(search_users);
};
// I_THINK_ITS_4_DEV_PURPOSES...BUT_NOT_SURE
module.exports.getAllUsers = async (req, res) => {
  return UserModel.find()
    .select("-password")
    .select("-email")
    .then((the_users) => res.json({ the_users }));
};
