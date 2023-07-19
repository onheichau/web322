/*********************************************************************************
 *  WEB322 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.
 *  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name: On Hei Chau, Paul
 *  Student ID: 172917213
 *  Date:  7 July 2023
 *
 *  Cyclic Web App URL: https://ill-calf-neckerchief.cyclic.app
 *
 *  GitHub Repository URL: https://github.com/onheichau/web322
 *
 ********************************************************************************/

const exphbs = require("express-handlebars");
const blog = require("./blog-service");
const path = require("path");
const stripJs = require("strip-js");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const express = require("express");
const app = express();
const upload = multer(); // no { storage: storage } since we are not using disk storage

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      navLink: (url, options) => {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: (lvalue, rvalue, options) => {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
      safeHTML: (context) => {
        return stripJs(context);
      },
      formatDate: function (dateObj) {
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      },
    },
  })
);

// state the extension name
app.set("view engine", ".hbs");

cloudinary.config({
  cloud_name: "dmdu09gw6",
  api_key: "961929566237721",
  api_secret: "xh_xCNtcxWxGu8xydW3-euvyd7U",
  secure: true,
});

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

const HTTP_PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.redirect("/blog");
});

app.get("/about", (req, res) => {
  res.render(path.join(__dirname, "views", "layouts", "about"));
});

// routing of blog button [published Post Only]
app.get("/blog", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blog.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blog.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;

    posts.forEach((po) => {
      po.postDate = po.postDate.toISOString().slice(0, 10);
    });

    viewData.post = post;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blog.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render(path.join(__dirname, "views", "layouts", "blog"), {
    data: viewData,
  });
});

app.get("/blog/:id", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blog.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blog.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    console.log("the id receive is: ", req.params.id);
    // Obtain the post by "id"
    viewData.post = await blog.getPostById(req.params.id);
    console.log(viewData.post);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blog.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "blog" view with all of the data (viewData)
  res.render(path.join(__dirname, "views", "layouts", "blog"), {
    data: viewData,
  });
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
      if (posts.length) {
        posts.forEach((post) => {
          post.postDate = post.postDate.toISOString().slice(0, 10);
        });
        res.render(path.join(__dirname, "views", "layouts", "posts"), {
          posts,
        });
      } else {
        res.render(path.join(__dirname, "views", "layouts", "posts"), {
          message: "no results",
        });
      }
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
    .then((categoryList) => {
      categoryList.length
        ? res.render(path.join(__dirname, "views", "layouts", "categories"), {
            data: categoryList,
          })
        : res.render(path.join(__dirname, "views", "layouts", "categories"), {
            message: "no results",
          });
    })
    .catch((err) => {
      res.render(path.join(__dirname, "views", "layouts", "category"), {
        message: err,
      });
    });
});

app.get("/categories/add", (req, res) => {
  res.render(path.join(__dirname, "views", "layouts", "addCategory"));
});

app.post("/categories/add", upload.none(), (req, res) => {
  console.log(req.body);
  console.log(req.body.category);
  blog
    .addCategroy(req.body.category)
    .then((msg) => {
      console.log(msg);
      res.redirect("/categories");
    })
    .catch((err) => {
      res.status(505).send({ message: err });
    });
});

app.get("/categories/delete/:id", (req, res) => {
  blog
    .deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch(() => {
      res.status(500).send("Unable to Remove Category / Category not found");
    });
});

app.get("/posts/add", (req, res) => {
  blog.getCategories().then((categoryList) => {
    console.log(categoryList);
    res.render(path.join(__dirname, "views", "layouts", "addPost.hbs"), {
      data: categoryList,
    });
  });
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
      post.body = req.body.body || null;
      post.title = req.body.title || null;
      post.featureImage = imageUrl || null;
      post.postDate = new Date();
      post.published = !!req.body.published;
      post.categoryId = Number(req.body.category);

      blog.addPost(post).then((post) => {
        resolve(post);
      });
    });
  }
});

app.get("/posts/delete/:id", (req, res) => {
  blog
    .deletePostById(req.params.id)
    .then(() => {
      res.redirect("/posts");
    })
    .catch(() => {
      res.status(500).send("Unable to Remove Post / Post not found");
    });
});

// 404 handling
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "notFound.html"));
});

// use(express.urlencoded({ :true}))

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
