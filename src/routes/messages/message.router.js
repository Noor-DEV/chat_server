const { protectRoute } = require("../../middlewares/authMiddleware");
const { sendMessage, getAllChatMessages } = require("./message.controller");

const router = require("express").Router();

// SEND A MESSAGE
router.post("/", protectRoute, sendMessage);
// FETCH ALL MESSAGES OF A CHAT
router.get("/:chatId", getAllChatMessages);
module.exports = router;
