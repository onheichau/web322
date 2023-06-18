const fs = require("fs");
const path = require("path");

let posts = [];
let categories = [];

const readFilePromise = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (readErr, data) => {
      if (!readErr) {
        try {
          resolve(JSON.parse(data));
        } catch (parseErr) {
          reject(parseErr);
        }
      } else {
        reject(readErr);
      }
    });
  });
};

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
      .catch((err) => {
        reject(err);
      });
  });
};

const getAllPosts = () => {
  return new Promise((resolve, reject) => {
    posts.length ? resolve(posts) : reject(new Error("No posts fetched"));
  });
};

const getPublishedPosts = () => {
  return new Promise((resolve, reject) => {
    let publishedPost = [];
    if (posts.length) {
      publishedPost = posts.filter((ele) => ele.published);
    }
    publishedPost.length
      ? resolve(publishedPost)
      : reject(new Error("no published post found"));
  });
};

const getPostByCategory = (categoryId) => {
  return new Promise((resolve, reject) => {
    let catergoryFilteredPost;

    if (categoryId < 1 || categoryId > 5) {
      reject(Error("Invalid category id"));
    } else {
      catergoryFilteredPost = posts.filter(
        (post) => Number(post.category) === Number(categoryId)
      );
      catergoryFilteredPost.length && resolve(catergoryFilteredPost);
      !catergoryFilteredPost.length && reject(Error("no results returned"));
    }
  });
};

const getPostByMinDate = (date) => {
  return new Promise((resolve, reject) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const dateFilteredPost = posts.filter((post) => {
        const postDate = new Date(post.postDate);
        const boundaryDate = new Date(date);
        return postDate.getTime() >= boundaryDate.getTime();
      });

      dateFilteredPost.length && resolve(dateFilteredPost);
      !dateFilteredPost.length && reject(Error("no results returned"));
    } else {
      reject(Error("Invalid date input"));
    }
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    categories.length
      ? resolve(categories)
      : reject(new Error("No categories fetched"));
  });
};

const getPostById = (id) => {
  return new Promise((resolve, reject) => {
    const index = posts.findIndex((post) => Number(post.id) === Number(id));

    index != -1 ? resolve(posts[index]) : reject(Error("no result returned"));
  });
};

const addPost = (post) => {
  return new Promise((resolve, reject) => {
    post.published = !!post.published;

    post.id = posts.length + 1;
    posts.push(post);
    resolve(post);
  });
};

module.exports = {
  initialize,
  getAllPosts,
  getPublishedPosts,
  getCategories,
  addPost,
  getPostByCategory,
  getPostByMinDate,
  getPostById,
};
