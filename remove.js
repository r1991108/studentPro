const mongoose = require("mongoose");
const Student = require("./models/student");

mongoose
  .connect("mongodb://localhost:27017/studentDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to mongoDb.");
  })
  .catch((e) => {
    console.log("Connection failed.");
    console.log(e);
  });

// Student.remove({})
//   .then(() => {
//     console.log("has been removed");
//   })
//   .catch((e) => {
//     console.log("something happened. hasn't been removed.");
//   });

Student.find({})
  .then((data) => {
    console.log(data);
  })
  .catch((e) => {
    console.log("find failed.");
    console.log(e);
  });
