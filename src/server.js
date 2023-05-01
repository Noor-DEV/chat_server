const app = require("./app");
const server = require("http").createServer(app);
const { Server } = require("socket.io");

require("dotenv").config();

const connectDB = require("./config/db");

const PORT = process.env.PORT;
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
io.on("connection", (socket) => {
  console.log("SOCKET.IO connected.........");
  socket.on("setup", (userData) => {
    //._id should be the chatId
    console.log(userData._id, ".......setup.....");
    socket.join(userData._id);
    socket.emit("connected");
  });
  socket.on("join room", ({ room, userInfo }) => {
    socket.join(room);
    console.log(`USER ${userInfo.name} JOINED ROOM: ${room} ....`);
  });
  socket.on("new message", (msgData) => {
    console.log("NEW_MSG_RECEIVED.......", msgData.content, msgData.chat._id);

    const chat = msgData.chat;
    if (chat.users.length < 1) return console.log("chat.users not defined");
    // chat.users.forEach((singleUser) => {
    //   if (singleUser._id === msgData.sender._id) return;
    //   socket.in(singleUser._id).emit("incoming message", msgData);
    //   console.log("MSG BROADCASTED........");
    // });
    socket.to(msgData.chat._id).emit("incoming message", msgData);
  });
  socket.on("typing", ({ the_chat, user_name }) => {
    socket.to(the_chat).emit("typing", { the_chat, user_name });
    console.log(user_name, "......typing.....", the_chat);
  });
  socket.on("stop typing", ({ the_chat }) => {
    console.log(the_chat, "......stopp typing.....");
    socket.to(the_chat).emit("stop typing");
  });
  socket.off("setup", (userData) => {
    console.log("USER_DISCONNECTED!");
    socket.leave(userData._id);
  });
});

connectDB().then((conn) => {
  server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT: ${PORT}`, conn.connection.host);
  });
});
