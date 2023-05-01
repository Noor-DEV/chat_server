const MessageModel = require("../../models/messages/message.model");
const UserModel = require("../../models/users/user.model");
const ChatModel = require("../../models/chats/chat.model");

module.exports.sendMessage = async (req, res) => {
  const { chatId, content } = req.body;
  if ((!content, !chatId)) {
    return res
      .status(400)
      .json({ msg: "Not a valid message or valid chat... checkb4sending..." });
  }
  const chatMsg = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };
  try {
    let message = await MessageModel.create(chatMsg);
    message = await message.populate("sender", "name profile_pic");
    //   .execPopulate(); DEPRECATED BY MONGOOSE
    // .execPopulate(); DEPRECATED BY MONGOOSE
    message = await UserModel.populate(message, {
      path: "chat.users",
      select: "name profile_pic email",
    });
    message = await message.populate("chat");

    // should u send the whole message as latestMessage or just the message._id
    await ChatModel.findByIdAndUpdate(chatId, { latestMessage: message._id });
    res.json(message);
  } catch (err) {
    res.status(400);
    console.log("ERROR SENDING MESSAGE.....");
    throw new Error(err.message);
  }
};
module.exports.getAllChatMessages = async (req, res) => {
  const { chatId } = req.params;
  let allChatMessages = await MessageModel.find({ chat: chatId })
    .populate("sender", "name profile_pic email")
    .populate("chat");
  allChatMessages = await ChatModel.populate(allChatMessages, {
    path: "chat.users",
    select: "name profile_pic email",
  });
  return res.json(allChatMessages);
};
