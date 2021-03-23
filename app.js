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

mongoose.connect(
  "mongodb+srv://"+user+":"+passwd+"@"+db+"?retryWrites=true&w=majority",
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
    required: [true, "Needs Title"],
  },
  content: {
    type: String,
    required: [true, "Needs"],
  },
  tags: [tagSchema]
};

const Post = mongoose.model("Post", postSchema);

const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const  contactContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const aboutContent =
  "Scelerisque _eleifend_ donec **pretium** vulputate sapien. **Rhoncus** urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

function copyrightString() {
  const year = new Date().getFullYear();
  const dateStr = (year > 2021)?" 2021 - "+year : year;
  return "Copyright © " + dateStr + " Eligio Becerra";
}

/// Home GET
app.get("/", (req, res) => {
  Post.find({}, (err, posts) => {
    if (!err){
      res.render("home", { postData: homeStartingContent, posts: posts, copyString: copyrightString() });
    }
  });

  
});

/// About GET
app.get("/about", (req, res) => {
  const content = md.render(aboutContent)
  console.log(content);
  res.render("about", { postData: content, copyString: copyrightString() });
});

/// Contact GET
app.get("/contact", (req, res) => {
  res.render("contact", { postData: contactContent, copyString: copyrightString() });
});

/// Compose GET
app.get("/compose", (req, res) => {
  res.render("compose", {copyString: copyrightString()});
});

/// Compose POST
app.post("/compose", (req, res) => {
  const p = new Post(
    {
      title : req.body.postTitle,
      content : req.body.postContent,
    }
  );
  p.tags.push({name: "default"});
  p.save((err) =>{
    if(!err){
      res.redirect("/");
    }
  });
});

/// Posts GET
/// url: /posts/:postTitle
app.get("/posts/:postId", (req, res) => {
  Post.findById(req.params.postId, (err, post) => {
    if (!err){
      if (post) {
        res.render("post", { post: post, copyString: copyrightString() });
      } else {
        res.redirect("/");
      }
    }
  })
  // post = Posts.find(
  //       (post) => post._id === req.params.postId
  // );
  // console.log(post);
  
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
