const fs = require("fs");
const path = require("path");

let posts = [];
let categories = [];

const readFilePromise = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      err && reject(err);

      try{
        resolve(JSON.parse(data))
      } catch(parseErr) {
        reject(parseErr);
      }
    })
  });
}

const initialize = () => {
  return new Promise((resolve, reject) => {
    Promise.all([
      readFilePromise(path.join(__dirname, "data", "posts.json")),
      readFilePromise(path.join(__dirname, "data", "categories.json")),
    ])
    .then(([postsData, catagoriesData]) => {
      posts = postsData;
      categories = catagoriesData;
      resolve("Success to read data from file system. ");
    })
    .catch(err => {reject(err)});
  });
};

const getAllPosts = () => {
  return new Promise((resolve, reject) => {
    posts.length? resolve(posts) : reject(new Error("No posts fetched"));
  });
};

const getPublishedPosts = () => {
  return new Promise((resolve, reject) => {
    let publishedPost = [];
    if(posts.length) { 
      publishedPost = posts.filter(ele => ele.published); 
    }
    publishedPost.length? 
      resolve(publishedPost) : reject(new Error("no published post found"));
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    categories.length? resolve(categories) : reject(new Error("No categories fetched"));
  });
};

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
};