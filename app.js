import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";

dotenv.config();
const port = 3000;
const app = express();
const secret = process.env.SECRET;
const saltRound = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

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

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Home page
app.get("/", (req, res) => {
  res.render("home");
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login");
});

// Register Page
app.get("/register", (req, res) => {
  res.render("register");
});

// Secrets Page
app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

// Login POST
app.post("/login", async (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

// Register POST
app.post("/register", async (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );
});

// Logout User
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.listen(port, (req, res) => {
  connectDB();
  console.log(`Server running at port `, port);
});
