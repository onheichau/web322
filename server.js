const blog = require('./blog-service');
const path = require('path')
const express = require('express');
const app = express()

const HTTP_PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about.html"));
});

// routing of blog button [published Post Only]
app.get("/blog", (req, res) => {
  blog.getPublishedPosts()
  .then(publishedPostArr => { res.send(publishedPostArr); })
  .catch(err => res.send({message: err}));
})

// routing of post [All Post]
app.get("/posts", (req, res) => {
  blog.getAllPosts()
  .then(allPostsArr => { res.send(allPostsArr); })
  .catch(err => res.send({message: err}));
});

// routing of catagories
app.get("/categories", (req, res) => {
  blog.getCategories()
  .then(data => { res.send(data) })
  .catch(err => res.send({message: err}));
});

// 404 handling
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "notFound.html"));
})

blog.initialize()
.then((msg) => {
  app.listen(HTTP_PORT, () => {console.log(msg, "server start")});
})
.catch(err => {console.log(err)});