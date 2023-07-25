const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  password: String,
  email: { type: String, unique: true },
  loginHistory: [{ dateTime: Date, userAgent: String }],
});

let User;

const initialize = () => {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(
      "mongodb+srv://ochau2:0CNqNEa7cSL54fc4@seneca.eqelbzr.mongodb.net/?retryWrites=true&w=majority",
    );

    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve("success connect to db!");
    });
  });
};

const registerUser = (userData) => {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
    } else {
      bcrypt
        .hash(userData.password, 10)
        .then((hash) => {
          userData.password = hash;

          let newUser = new User(userData);

          newUser
            .save()
            .then(() => resolve())
            .catch((err) => {
              err.code === 11000
                ? reject("User Name already taken")
                : reject(`There was an error creating user: ${err}`);
            });
        })
        .catch((err) => {
          reject(`There was an error hashing the password: ${err}`);
        });
    }
  });
};

const checkUser = (userData) => {
  return new Promise((resolve, reject) => {
    console.log("received login request, in auth-data function : ", userData);

    User.findOne({ userName: userData.userName })
      .then((user) => {
        if (!user) {
          reject(`Unable to find user: ${userData.userName}`);
        } else {
          bcrypt
            .compare(userData.password, user.password)
            .then((match) => {
              if (!match) {
                reject(`Incorrect Password for user: ${userData.userName}`);
              } else {
                const loginRecord = {
                  dateTime: new Date().toString(),
                  userAgent: userData.userAgent,
                };
                // update the documents
                User.updateOne(
                  { userName: user.userName }, // query by user name
                  {
                    $push: {
                      // alter (push back) login history
                      loginHistory: loginRecord,
                    },
                  },
                )
                  .then(() => {
                    user.loginHistory.push(loginRecord);
                    resolve(user);
                  })
                  .catch((err) => {
                    reject(`There was an error verifying the user: ${err}`);
                  });
              }
            })
            .catch((err) => {
              reject(`Error comparing passwords: ${err}`);
            });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  initialize,
  registerUser,
  checkUser,
};
