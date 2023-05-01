const ChatModel = require("../../models/chats/chat.model");
const UserModel = require("../../models/users/user.model");

module.exports.accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("User param NOT SENT WITH REQUEST...");
    return res.sendStatus(400);
  }
  let isChat = await ChatModel.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await UserModel.populate(isChat, {
    path: "latestMessage.sender",
    select: "name profile_pic email",
  });
  if (isChat.length > 0) {
    //IF CHAT ALREADY EXISTS JUST RETURN IT TO ACCESS IT.
    res.send(isChat[0]);
  } else {
    //ELSE CREATE THE CHAT..
    let chatData = {
      chatName: "Sender...",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await ChatModel.create(chatData);
      const fullChat = await ChatModel.findOne({
        _id: createdChat._id,
      }).populate("users", "-password");
      res.status(200).send(fullChat);
    } catch (err) {
      return res.status(500).json({
        err: true,
        msg: "ERROR CREATING A CHAT..",
        type: "DB_ERROR",
        errorMessage: err.message,
      });
    }
  }
};
//HAVE 2 REVISIT THIS FUNCTION......
module.exports.fetchChats = async (req, res) => {
  try {
    //PASTED.......
    ChatModel.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await UserModel.populate(results, {
          path: "latestMessage.sender",
          select: "name profile_pic email",
        });
        res.status(200).send(results);
      });
    //PASTED.......
    // const chats = await ChatModel.find({
    //   users: { $elemMatch: { $eq: req.user._id } },
    // })
    //   .populate("users", "-password")
    //   .populate("groupAdmin", "-password")
    //   .populate("latestMessage")
    //   .sort({ updatedAt: -1 })
    //   .then(async (results) => {
    //     console.log("INSIDE POPULATE LATEST MESSAGE........")
    //     results = await UserModel.populate(results, {
    //       path: "latestMessage.sender",
    //       select: "name profile_pic email",
    //     });
    //     return res.status(200).send(results);
    //   });
    //************
    // res.send({ amount: chats.length, chats });
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
};

module.exports.createGroupChat = async (req, res) => {
  const { users, groupName } = req.body;
  // console.log(
  //   req.body,
  //   "........req.body.......",
  //   JSON.parse(users),
  //   "....inline.parsed.users......"
  // );
  // const the_users = JSON.parse(users);
  // const the_users = users;
  // console.log(the_users, "......the_users.....");
  if (!users || !groupName) {
    return res.status(400).json({ msg: "Please Fill All The Fields" });
  }
  if (users.length < 2) {
    return res.status(400).json({
      msg: "A group must have more than 2 users",
      type: "LESS_GRP_USERS",
    });
  }

  const all_the_users = [...users, req.user._id];

  try {
    const createdGrpChat = await ChatModel.create({
      chatName: groupName,
      isGroupChat: true,
      users: all_the_users,
      groupAdmin: req.user._id,
    });
    const fullGrpChat = await ChatModel.findOne({ _id: createdGrpChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .catch((err) => {
        return res.status(500).json({
          msg: "ERROR CREATING GROUP CHAT...",
          errorMessage: err.message,
        });
      });
    return res.status(201).json(fullGrpChat);
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "ERROR CREATING GROUP CHAT...", errorMessage: err.message });
  }
};
module.exports.renameGroupChat = async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await ChatModel.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage");

  if (!updatedChat) {
    return res
      .status(401)
      .json({ msg: "CHAT NOT FOUND...", type: "NOT_FOUND" });
  } else {
    return res.status(200).json(updatedChat);
  }
};
module.exports.addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  const updatedChat = await ChatModel.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    return res
      .status(500)
      .json({ msg: "EMPTY UPDATED CHAT AFTER attempting 2 add user to group" });
  }
  return res.status(200).json(updatedChat);
};
module.exports.addBunchToGroup = async (req, res) => {
  const { chatId, users_list } = req.body;
  const updatedChat = await ChatModel.findByIdAndUpdate(
    chatId,
    { $push: { users: { $each: users_list } } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    return res.status(500).json({
      msg: "EMPTY UPDATED CHAT AFTER attempting 2 add user to group",
    });
  }
  return res.status(200).json(updatedChat);
};
module.exports.removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  const updatedChat = await ChatModel.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    return res.status(500).json({
      msg: "EMPTY UPDATED CHAT AFTER attempting 2 remove user from group",
    });
  }
  return res.status(200).json(updatedChat);
};
module.exports.adminLeaveGroup = async (req, res) => {
  const { chatId, newAdmin, oldAdmin } = req.body;
  const updatedGroup = await ChatModel.findOneAndUpdate(
    { _id: chatId, isGroupChat: true, groupAdmin: oldAdmin },
    { groupAdmin: newAdmin, $pull: { users: oldAdmin } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  return res.json(updatedGroup);
};
//FOR DEV_PURPOSES
module.exports.getAllGrpChats = async (req, res) => {
  const the_chats = await ChatModel.find({ isGroupChat: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  return res.json({ amount: the_chats.length, chats: the_chats });
};
