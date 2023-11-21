//jshint esversion:6
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import md5 from "md5";

dotenv.config();
const port = 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const secret = process.env.SECRET;

// Connect to data base
const connectDB = async () => {
  try {
    const connect = await mongoose.connect(
      "mongodb+srv://krathishsk123:krathish@cluster0.vvt5ltp.mongodb.net/AuthTesting?retryWrites=true&w=majority"
    );
    console.log("Connected to : ", connect.connection.name, " database");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

// Create a schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", async (req, res) => {
  const { username: email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (md5(password) === user.password) {
      res.render("secrets");
    } else res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/register", async (req, res) => {
  const { username: email, password } = req.body;
  await User.create({ email, password: md5(password) });
  res.render("secrets");
});

app.listen(port, (req, res) => {
  connectDB();
  console.log(`Server running at port `, port);
});
