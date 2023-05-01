const mongoose = require("mongoose");

const connectDB = async () => {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        //   useFindAndModify: true,
      })
      .then((conn) => {
        resolve(conn);
        // console.log(`MONG_DB CONNECTED....:${conn.connection.host}`);
      })
      .catch((err) => {
        reject(err);
        // console.log(err);
        // console.log(`ERROR: ${err.message}.................`);
        // process.exit();
      });
  });
};

module.exports = connectDB;
