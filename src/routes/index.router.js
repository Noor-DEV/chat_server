const router = require("express").Router();
const userRoutes = require("./users/user.router");
const chatRoutes = require("./chats/chat.router");
const messageRoutes = require("./messages/message.router");

// /api/

router.use("/user", userRoutes);
router.use("/chat", chatRoutes);
router.use("/message", messageRoutes);
module.exports = router;
