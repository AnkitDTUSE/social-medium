const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const upload = require("./config/multer.config.js");

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  let users = await userModel.find();
  res.render("index", { users });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profile", isLoggedIn, async (req, res) => {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("posts");
  res.render("profile", { user });
});

app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }
  await post.save();
  console.log(post.user)
  res.redirect(`/profile`);
});

app.get("/like_view/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }
  await post.save();
  console.log(post.user)
  res.redirect(`/show/${post.user.email}`);
});

app.get("/edit/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  res.render("edit", { post });
});

app.post("/update/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOneAndUpdate(
    { _id: req.params.id },
    { content: req.body.postData }
  );
  res.redirect("/profile");
});

app.post("/post", isLoggedIn, async (req, res) => {n
  let user = await userModel.findOne({ email: req.user.email });
  let post = await postModel.create({
    user: user._id,
    content: req.body.postData,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

app.post("/register", async (req, res) => {
  let { name, username, password, email, age } = req.body;
  if (await userModel.findOne({ email }))
    return res.status(500).send("already existed user");
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let newUser = await userModel.create({
        name,
        username,
        email,
        password: hash,
        age,
      });
      let token = jwt.sign({ email, userid: newUser._id }, "sshhhh");

      res.cookie("newtoken", token);
      res.redirect("/login");
    });
  });
});

app.post("/login", async (req, res) => {
  let { password, email } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("Something went wrong");
  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email, userid: user._id }, "sshhhh");
      res.cookie("newtoken", token);
      res.status(200).redirect("/profile");
    } else res.redirect("/login");
  });
});

app.get("/logout", (req, res) => {
  res.cookie("newtoken", "");
  res.redirect("/login");
});

function isLoggedIn(req, res, next) {
  if (req.cookies.newtoken === "") res.redirect("/login");
  else {
    let data = jwt.verify(req.cookies.newtoken, "sshhhh");
    req.user = data;
  }
  next();
}

// app.get("/profile/upload", (req, res) => {
//   res.render("profileUpload");
// });

app.post("/upload", isLoggedIn, upload.single("pfpImage"), async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  user.profilePic = req.file.filename;
  await user.save();
  res.redirect("/profile");
});

app.get("/profileEditor", isLoggedIn, async (req, res) => {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("posts");
  res.render("profileEditor", { user });
});

app.get("/deletePfp", isLoggedIn, async (req, res) => {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("posts");
  user.profilePic = undefined;
  await user.save();
  res.redirect("/profile");
});

app.get("/show/:email", async (req, res) => {
  // console.log(req.params.email)
  let user = await userModel
    .findOne({ email: req.params.email })
    .populate("posts");
  res.render("show", { user });
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
