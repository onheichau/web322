/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: On Hei Chau, Paul  
*  Student ID: 172917213 
*  Date: May 31 2023
*
*  Cyclic Web App URL: https://ill-calf-neckerchief.cyclic.app
*
*  GitHub Repository URL: https://github.com/onheichau/web322
*
********************************************************************************/ 

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
  .then(publishedPostArr => { res.json(publishedPostArr); })
  .catch(err => res.send({message: err}));
})

// routing of post [All Post]
app.get("/posts", (req, res) => {
  blog.getAllPosts()
  .then(allPostsArr => { res.json(allPostsArr); })
  .catch(err => res.send({message: err}));
});

// routing of catagories
app.get("/categories", (req, res) => {
  blog.getCategories()
  .then(data => { res.json(data) })
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