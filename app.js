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
    required: [true, "No Title"],
  },
  content: {
    type: String,
    required: [true, "No content"],
  },
  postDate: {
    type: Date,
    required: [true, "No Date"]
  },
  tags: [tagSchema]
};

const Post = mongoose.model("Post", postSchema);

const homeStartingContent = "Este es mi blog. Lo actualizado esporadicamente :)\n\n " +
"Algunos de los temas que trato son [programacion](/programming)\n\n " +
"[webdev](/webdev) y otros temas no tecnologicos";
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
  Post.find({ title: {$nin: ["__about", "__contact"]} }, (err, posts) => {
    if (!err){
      //TODO: Better sending of the post information to the site
      res.render("home", { postData: md.render(homeStartingContent), posts: posts, copyString: copyrightString() });
    }
  }).limit(1);
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
        post.content = md.render(post.content);
        res.render("post", { post: post, copyString: copyrightString() });
      } else {
        res.redirect("/");
      }
    }
  })
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port " + (process.env.PORT || 3000));
});
