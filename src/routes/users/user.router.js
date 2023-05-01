const router = require("express").Router();
const { protectRoute } = require("../../middlewares/authMiddleware");
const { errorHandler, notFound } = require("../../middlewares/errorMiddleware");
const {
  LoginUser,
  RegisterUser,
  getAllSearchUsers,
  getAllUsers,
} = require("./user.controller");
const { upload } = require("../../config/imgUpload");
router.post("/login", LoginUser);
router.post("/register", upload.single("profile_pic"), RegisterUser);
router.get("/", protectRoute, getAllSearchUsers);
router.get("/all", protectRoute, getAllUsers);
router.use(notFound);
router.use(errorHandler);
module.exports = router;
