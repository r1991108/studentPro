const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Student = require("./models/student");
const { removeAllListeners } = require("./models/student");
const methodOverride = require("method-override");

// middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
// mongoose.set("useFindAndModify", false);

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

app.get("/students/delete", (req, res) => {
  try {
    res.render("delete.ejs");
  } catch (e) {
    res.send("Error!");
    console.log(e);
  }
});

app.get("/students/:id", async (req, res) => {
  // console.log(req.params);
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render("studentPage.ejs", { data });
    } else {
      res.render("err.ejs");
    }
  } catch (e) {
    res.send("Error!");
    console.log(e);
  }
});

app.get("/students/edit/:id", async (req, res) => {
  // console.log(req.params);
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render("edit.ejs", { data });
    } else {
      res.render("err.ejs");
    }
  } catch (e) {
    res.send("Error!");
    console.log(e);
  }
});

// method-override for update data using put
app.put("/students/edit/:id", async (req, res) => {
  console.log(req.body);
  // res.send("thanks for sending put request.");

  let { id, name, age, merit, other } = req.body;
  try {
    let d = await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      { new: true, runValidators: true }
    );
    res.redirect(`/students/${id}`);
  } catch (e) {
    console.log(e);
    res.render("reject.ejs");
  }
});

app.delete("/students/delete/", (req, res) => {
  console.log(req.body);
  let { id, name } = req.body;
  if (id !== null) {
    Student.deleteOne({ id })
      .then((msg) => {
        console.log(msg);
        res.send(`Deleted successfully. ID: ${id} has been deleted.`);
      })
      .catch((e) => {
        console.log(e);
        res.send("delete failed.");
      });
  } else {
    res.render("reject.ejs");
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

// for RESTful API
app.get("/studentsAPI", async (req, res) => {
  //   res.send("This is students page.");
  try {
    let data = await Student.find();
    res.send(data);
  } catch (e) {
    res.send({ msg: "Error with finding data." });
  }
});

// for RESTful API
app.get("/studentsAPI/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.send(data);
    } else {
      res.status(404);
      res.send({ msg: "cannot find data." });
    }
  } catch (e) {
    res.send("Error!");
    console.log(e);
  }
});

// for RESTful API
app.post("/studentsAPI/insert", (req, res) => {
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
      res.send({ msg: "Successfully past a new student." });
    })
    .catch((e) => {
      res.status(404);
      res.send(e);
    });
});

// for RESTful API
// to update all of the data
app.put("/studentsAPI/:id", async (req, res) => {
  let { id, name, age, merit, other } = req.body;
  try {
    let d = await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      { new: true, runValidators: true, overwrite: true }
    );
    res.send(`Successfully updated the data.`);
  } catch (e) {
    res.status(404);
    res.send(e);
  }
});

// for RESTful API
// to update part of the data
class newData {
  constructor() {}
  setProperty(key, value) {
    if (key !== "merit" && key !== "other") {
      this[key] = value;
    } else {
      this[`scholarship.${key}`] = value;
    }
  }
}
app.patch("/studentsAPI/:id", async (req, res) => {
  let { id } = req.params;
  let newObject = new newData();
  for (let property in req.body) {
    newObject.setProperty(property, req.body[property]);
  }
  try {
    let d = await Student.findOneAndUpdate({ id }, newObject, {
      new: true,
      runValidators: true,
    });
    res.send(`Successfully updated the data.`);
  } catch (e) {
    res.status(404);
    res.send(e);
  }
});

// for RESTful API
// to delete specific data by ID
app.delete("/studentsAPI/delete/:id", (req, res) => {
  let { id } = req.params;
  Student.deleteOne({ id })
    .then((msg) => {
      console.log(msg);
      res.send(`Deleted successfully. ID: ${id} has been deleted.`);
    })
    .catch((e) => {
      console.log(e);
      res.send("delete failed.");
    });
});

// for RESTful API
// to delete all data
app.delete("/studentsAPI/deleteAll", (req, res) => {
  Student.deleteMany({})
    .then((msg) => {
      console.log(msg);
      res.send(`All data has been deleted successfully.`);
    })
    .catch((e) => {
      console.log(e);
      res.send("delete failed.");
    });
});

app.get("/*", (req, res) => {
  res.status(404);
  res.send("wrong url");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
