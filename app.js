const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Student = require("./models/student");
const { removeAllListeners } = require("./models/student");

// middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

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

app.get("/", (req, res) => {
  console.log("return homepage");
  res.send("This is homepage.");
});

app.get("/students", async (req, res) => {
  //   res.send("This is students page.");

  try {
    let data = await Student.find();
    res.render("students.ejs", { data });
  } catch (e) {
    res.send("error with finding data");
  }
});

app.get("/students/insert", (req, res) => {
  res.render("studentInsert.ejs");
});

app.get("/students/:id", async (req, res) => {
  // console.log(req.params);
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    res.render("studentPage.ejs", { data });
  } catch (e) {
    res.send("Error!");
    console.log(e);
  }
});

app.post("/students/insert", (req, res) => {
  //   console.log(req.body);
  //   res.send("tanks for posting.");
  let { id, name, age, merit, other } = req.body;
  let newStudent = new Student({
    id,
    name,
    age,
    scholarship: { merit, other },
  });
  newStudent
    .save()
    .then(() => {
      console.log("Student accepted.");
      res.render("accept.ejs");
    })
    .catch((e) => {
      console.log("Student not accepted.");
      console.log(e);
      res.render("reject.ejs");
    });
});

app.get("/*", (req, res) => {
  res.status(404);
  res.send("wrong url");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
