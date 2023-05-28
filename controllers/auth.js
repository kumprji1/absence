const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const moment = require("moment");

const nodemailer = require("nodemailer");
// const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kalendar.skolavrchlabi@gmail.com",
    pass: "jkoqwysipatfgoti"
  }
});

exports.getResetPassword = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.render("auth/resetPassword", {
      oldInput: {
        email: undefined,
        errorMessage: undefined
      },
      csrfToken: req.csrfToken()
    });
  }
  res.redirect("/home");
};

exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/home");
    }
    const token = buffer.toString("hex");
    let user;
    User.findOne({ email: req.body.email.toLowerCase() })
      .then(userDoc => {
        if (userDoc) {
          var resetTokenExp = new Date();
          resetTokenExp = moment(resetTokenExp)
            .add(7200000, "ms")
            .toDate();
          user = userDoc;
          userDoc.resetToken = token;
          userDoc.resetTokenExpiration = resetTokenExp;
          return userDoc.save();
        }
        return res.render("auth/resetPassword", {
          oldInput: {
            email: req.body.email,
            errorMessage: "Tento email není registrovaný"
          },
          csrfToken: req.csrfToken()
        });
      })
      .then(saved => {
        res.redirect("/");
        return transporter.sendMail({
          to: user.email,
          from: "kalendar.skolavrchlabi@gmail.com",
          subject: "Změna hesla",
          html: `
                <p>Změna hesla</p>
                <p>Klikni <a href="http://absence-diakonie.herokuapp.com/reset/${token}">zde</a> pro změnu hesla.</p>
                `
        });
      })
      .catch(err => {
        console.log(err);
      });
  });
};

exports.getLogin = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.render("auth/login", {
      csrfToken: req.csrfToken(),
      errorMessage: undefined
    });
  }
  res.redirect("/home");
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  User.findOne({ email: email }).then(user => {
    if (!user) {
      return res.render("auth/login", {
        csrfToken: req.csrfToken(),
        errorMessage: "Email tu není registrovaný"
      });
    }
    bcrypt
      .compare(password, user.password)
      .then(match => {
        if (match) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            console.log(err);
            res.redirect("/home");
          });
        } else {
          return res.render("auth/login", {
            csrfToken: req.csrfToken(),
            errorMessage: "Špatné heslo"
          });
        }
      })
      .then(result => {})
      .catch(err => {
        console.log(err);
      });
  });
};

exports.getRegister = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.render("auth/register", {
      errorMessage: undefined,
      oldInput: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordAgain: ""
      },
      csrfToken: req.csrfToken()
    });
  }
  res.redirect("/home");
};

exports.postRegister = (req, res, next) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const workplace = req.body.workplace;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("auth/register", {
      errorMessage: errors.array()[0].msg,
      oldInput: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        passwordAgain: req.body.passwordAgain
      },
      csrfToken: req.csrfToken()
    });
  }
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/home");
    }
    const token = buffer.toString("hex");

    bcrypt
      .hash(password, 12)
      .then(hashedPassword => {
        const user = new User({
          firstName: firstName,
          lastName: lastName,
          email: email.toLowerCase(),
          password: hashedPassword,
          workplace: workplace,
          registrationToken: token,
          isVerified: 0
        });
        return user.save();
      })
      .then(saved => {
        res.redirect("/");
        return transporter.sendMail({
          to: email,
          from: "kalendar.skolavrchlabi@gmail.com",
          subject: "Ověření účtu",
          html: `
            <p>Klikni <a href="http://absence-diakonie.herokuapp.com/verify/${token}">zde</a> pro ověření účtu.</p>
            `
        });
      })
      .catch(err => {
        console.log(err);
      });
  });
};

exports.getVerify = (req, res, next) => {
  User.findOne({ registrationToken: req.params.token })
    .then(userDoc => {
      if (!userDoc) {
        return next();
      }
      userDoc.isVerified = 1;
      return userDoc.save();
    })
    .then(saved => {
      return res.redirect("/login");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  if (!req.session) {
    return next();
  }
  // if (req.session.isLoggedIn) {
  return req.session.destroy(err => {
    if (!err) {
      return res.redirect("/");
    }
    next(new Error(err));
    console.log(err);
  });
  // }
  // return res.redirect('/');
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(userDoc => {
      if (!userDoc) {
        return next();
      }
      res.render("auth/newPassword", {
        userId: userDoc._id.toString(),
        passwordToken: token,
        errorMessage: undefined,
        csrfToken: req.csrfToken()
      });
    })
    .catch(err => {});
};

exports.postNewPassword = (req, res, next) => {
  const userId = req.body.userId;
  const newPassword = req.body.password;
  const token = req.body.passwordToken;
  const errors = validationResult(req);
  // console.log(userId, newPassword, token);
  if (!errors.isEmpty()) {
    return res.render("auth/newPassword", {
      passwordToken: token,
      userId: userId,
      errorMessage: errors.array()[0].msg,
      csrfToken: req.csrfToken()
    });
  }
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      if (!user) {
        return res.redirect("/");
      }
      return bcrypt.hash(newPassword, 12).then(hashedPass => {
        user.password = hashedPass;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        return user.save().then(saved => {
          res.redirect("/");
        });
      });
    })
    .catch(err => {
      console.log(err);
    });
};
