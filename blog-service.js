const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes, Model } = require("sequelize");

// database connection
let sequelize = new Sequelize(
  "ymdqmiix",
  "ymdqmiix",
  "vYgdqJJoXWicSbCPAaAdzE9U6LE2ExMF",
  {
    host: "rajje.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

sequelize
  .authenticate()
  .then(function () {
    console.log("Connection has been established successfully.");
  })
  .catch(function (err) {
    console.log("Unable to connect to the database:", err);
  });

class Category extends Model {}
class Post extends Model {}

Category.init(
  {
    category: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: "category", // for no case-senestive purpose
  }
);

Post.init(
  {
    body: { type: DataTypes.TEXT, allowNull: true },
    title: { type: DataTypes.STRING, allowNull: true },
    postDate: DataTypes.DATE,
    featureImage: {
      type: DataTypes.STRING,
      defaultValue:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiB8giTN9Hj8QAEz4DVdCtqWbfnrKoZSo2nA&usqp=CAU",
    },
    published: DataTypes.BOOLEAN,
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: "categories",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "posts", // for non case-senestive purpose
  }
);

const initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve("All tables are synced.");
      })
      .catch((err) => {
        console.log("err in syncing database: ", err);
      });
  });
};

const getAllPosts = () => {
  return new Promise((resolve, reject) => {
    Post.findAll()
      .then((allPosts) => {
        resolve(allPosts);
      })
      .catch(() => {
        reject(new Error("No result returned"));
      });
  });
};

const getPublishedPosts = () => {
  return new Promise((resolve, reject) => {
    getAllPosts()
      .then((allPosts) => {
        const allPublishedPosts = allPosts.filter((post) => post.published);
        allPublishedPosts.length
          ? resolve(allPublishedPosts)
          : reject(new Error("no results returned"));
      })
      .catch((err) => {
        reject(new Error(err));
      });
  });
};

const getPostByCategory = (categoryId) => {
  return new Promise((resolve, reject) => {
    getAllPosts()
      .then((allPosts) => {
        const postsByCategory = allPosts.filter(
          (post) => post.categoryId === Number(categoryId)
        );
        postsByCategory.length
          ? resolve(postsByCategory)
          : reject(new Error("no results returned"));
      })
      .catch((err) => {
        reject(new Error(err));
      });
  });
};

const getPublishedPostsByCategory = (category) => {
  return new Promise((resolve, reject) => {
    getPostByCategory(category)
      .then((categorizedPost) => {
        const publishedCategorizedPosts = categorizedPost.filter(
          (post) => post.published
        );
        publishedCategorizedPosts.length
          ? resolve(publishedCategorizedPosts)
          : reject(new Error("no results returned"));
      })
      .catch((err) => {
        reject(new Error(err));
      });
  });
};

const getPostByMinDate = (date) => {
  return new Promise((resolve, reject) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      getAllPosts()
        .then((allPosts) => {
          const dateFilteredPost = allPosts.filter((post) => {
            const postDate = new Date(post.postDate);
            const boundaryDate = new Date(date);
            return postDate.getTime() >= boundaryDate.getTime();
          });
          dateFilteredPost.length
            ? resolve(dateFilteredPost)
            : reject(new Error("no results returned"));
        })
        .catch((err) => {
          reject(new Error(err));
        });
    } else {
      reject(Error("Invalid date input"));
    }
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((categories) => {
        resolve(categories);
      })
      .then((err) => {
        reject(err);
      });
  });
};

const getPostById = (id) => {
  return new Promise((resolve, reject) => {
    Post.findOne({ id })
      .then((post) => {
        resolve(post);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const addPost = (post) => {
  return new Promise((resolve, reject) => {
    console.log(post);
    Post.create(post)
      .then((newPost) => {
        resolve(`writed new post: \n${newPost}\n to database`);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const addCategroy = (categoryInput) => {
  return new Promise((resolve, reject) => {
    console.log("writing to db", categoryInput);
    Category.create({ category: categoryInput })
      .then((newInstance) => {
        resolve(`writed post:\n${newInstance}\n to database`);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const deleteCategoryById = (categoryId) => {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: {
        id: categoryId,
      },
    })
      .then((rowCount) => {
        resolve(`deleted ${rowCount} category from database`);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const deletePostById = (postId) => {
  return new Promise((resolve, reject) => {
    Post.destroy({
      where: {
        id: postId,
      },
    })
      .then((msg) => {
        resolve(`deleted ${msg} post from database`);
      })
      .catch((err) => {
        reject(err);
      });
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
  getPublishedPostsByCategory,
  getPostById,
  addCategroy,
  deletePostById,
  deleteCategoryById,
};
