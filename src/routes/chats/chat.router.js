const { protectRoute } = require("../../middlewares/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  getAllGrpChats,
  addToGroup,
  removeFromGroup,
  addBunchToGroup,
  adminLeaveGroup,
} = require("./chat.controller");

const router = require("express").Router();

// ALL THE ROUTES
//  /chat .getALLCHATS && CREATE A CHAT

router.post("/", protectRoute, accessChat);
router.get("/", protectRoute, fetchChats);

//CHAT GROUPS
//CREATE A GRP CHAT

router.get("/group/all", getAllGrpChats); //FOR DEV_PURPOSES
router.post("/group/create", protectRoute, createGroupChat);
//RENAME A GRP CHAT
router.post("/group/rename", protectRoute, renameGroupChat);
//REMOVE FROM A GRP CHAT
router.patch("/group/remove", protectRoute, removeFromGroup);
//ADD 2 GROUP
router.patch("/group/add", protectRoute, addToGroup);
router.patch("/group/add/bunch", protectRoute, addBunchToGroup);
//CHANGE ADMIN && LEAVE GROUP
router.patch("/group/admin/leave", adminLeaveGroup);

module.exports = router;
