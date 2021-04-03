//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const md = require("markdown-it")();

dotenv.config();

const user = process.env.MONGO_USR;
const passwd = process.env.MONGO_PWD;
const db = process.env.MONGO_DB;

console.log(user + " " + passwd + " " + db);

mongoose.connect(
  "mongodb+srv://" +
    user +
    ":" +
    passwd +
    "@" +
    db +
    "?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const tagSchema = {
  name: {
    type: String,
    required: [true, "Needs Title"],
  },
};

const Tag = mongoose.model("Tag", tagSchema);

const postSchema = {
  title: {
    type: String,
    required: [true, "No Title"],
  },
  content: {
    type: String,
    required: [true, "No content"],
  },
  date: {
    type: Date,
    required: [true, "No Date"],
  },
  tags: [tagSchema],
};

const Post = mongoose.model("Post", postSchema);

var rightside = "";

Post.findOne({ title: "__rightSide" }, (err, post) => {
  if (!err) {
    console.log(post);
    rightside = md.render(post.content);
  } else {
    console.log("no such post");
    return null;
  }
});

var leftside = "";

Post.findOne({ title: "__rightSide" }, (err, post) => {
  if (!err) {
    console.log(post);
    leftside = md.render(post.content);
  } else {
    console.log("no such post");
    return null;
  }
});

const contactContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";

var aboutContent = "";

Post.findOne({ title: "__about" }, (err, post) => {
  if (!err) {
    console.log(post);
    aboutContent = md.render(post.content);
  } else {
    console.log("no such post");
    return null;
  }
});

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

function copyrightString() {
  const year = new Date().getFullYear();
  const dateStr = year > 2021 ? " 2021 - " + year : year;
  return "Copyright © " + dateStr + " Eligio Becerra";
}

/// Home GET
app.get("/", (req, res) => {
  Post.find(
    { title: { $nin: ["__about", "__contact", "__rightSide", "__leftSide"] } },
    (err, posts) => {
      if (!err) {
        //TODO: Better sending of the post information to the site
        console.log(rightside);
        res.render("home", {
          posts: posts,
          copyString: copyrightString(),
          rightSide: rightside,
        });
      }
    }
  ) /*.limit(1)*/;
});

/// About GET
app.get("/about", (req, res) => {
  res.render("about", {
    postData: aboutContent,
    copyString: copyrightString(),
    rightSide: rightside,
  });
});

/// Contact GET
app.get("/contact", (req, res) => {
  res.render("contact", {
    postData: contactContent,
    copyString: copyrightString(),
    rightSide: rightside,
  });
});

/// Compose GET
app.get("/compose", (req, res) => {
  res.render("compose", {
    copyString: copyrightString(),
    rightSide: rightside,
  });
});

/// Compose POST
app.post("/compose", (req, res) => {
  const p = new Post({
    title: req.body.postTitle,
    content: req.body.postContent,
    date: Date(),
  });
  p.tags.push({ name: "default" });
  p.save((err) => {
    if (!err) {
      res.redirect("/");
    } else {
      console.log(err);
      res.redirect("/");
    }
  });
});

/// Posts GET
/// url: /posts/:postTitle
app.get("/posts/:postId", (req, res) => {
  Post.findById(req.params.postId, (err, post) => {
    if (!err) {
      if (post) {
        post.content = md.render(post.content);
        res.render("post", {
          post: post,
          copyString: copyrightString(),
          rightSide: rightside,
        });
      } else {
        res.redirect("/");
      }
    }
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port " + (process.env.PORT || 3000));
});
