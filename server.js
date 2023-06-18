/*********************************************************************************
 *  WEB322 – Assignment 02
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
 *  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: On Hei Chau, Paul
 *  Student ID: 172917213
 *  Date:  17 June 2023
 *
 *  Cyclic Web App URL: https://ill-calf-neckerchief.cyclic.app
 *
 *  GitHub Repository URL: https://github.com/onheichau/web322
 *
 ********************************************************************************/

const blog = require("./blog-service");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const express = require("express");
const app = express();
const upload = multer(); // no { storage: storage } since we are not using disk storage

cloudinary.config({
  cloud_name: "dmdu09gw6",
  api_key: "961929566237721",
  api_secret: "xh_xCNtcxWxGu8xydW3-euvyd7U",
  secure: true,
});

const HTTP_PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

// routing of blog button [published Post Only]
app.get("/blog", (req, res) => {
  blog
    .getPublishedPosts()
    .then((publishedPostArr) => {
      res.json(publishedPostArr);
    })
    .catch((err) => res.send({ message: err }));
});

app.get("/posts", (req, res) => {
  let postOperation;
  if (req.query.category) {
    postOperation = blog.getPostByCategory(req.query.category);
  } else if (req.query.minDate) {
    postOperation = blog.getPostByMinDate(req.query.minDate);
  } else {
    postOperation = blog.getAllPosts();
  }

  postOperation
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      res.send({ message: err });
    });
});

app.get("/post/:id", (req, res) => {
  blog
    .getPostById(req.params.id)
    .then((post) => {
      res.json(post);
    })
    .catch((err) => {
      res.send({ message: err });
    });
});

// routing of catagories
app.get("/categories", (req, res) => {
  blog
    .getCategories()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.send({ message: err }));
});

app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "addPost.html"));
});

// Form submission handling
app.post("/posts/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processPost(uploaded.url).then(() => {
        res.redirect("/posts");
      });
    });
  } else {
    processPost("").then(() => {
      res.redirect("/posts");
    });
  }

  function processPost(imageUrl) {
    return new Promise((resolve, reject) => {
      const post = {};
      post.featureImage = imageUrl;
      post.body = req.body.body;
      post.title = req.body.title;
      post.postDate = new Date();
      post.category = req.body.category;
      post.published = req.body.published;

      blog.addPost(post).then((post) => {
        resolve(post);
      });
    });
  }
});

// 404 handling
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "notFound.html"));
});

blog
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("server start");
    });
  })
  .catch((err) => {
    console.log(err);
  });
