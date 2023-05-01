const jwt = require("jsonwebtoken");
module.exports.generateToken = (user_id) => {
  return jwt.sign({ id: user_id }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};

module.exports.verifyToken = () => {};
