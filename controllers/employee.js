const User = require("../models/user");
const Event = require("../models/event");
const { validationResult } = require("express-validator");
const moment = require("moment");
const mongoose = require("mongoose");
const sortUtil = require("../utils/sortUtil");
const dateUtil = require("../utils/dateUtil");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kalendar.skolavrchlabi@gmail.com",
    pass: process.env.GMAIL_PASSWD
  }
});

// směrovač na výpisy absencí, podle pracoviště uživatele
exports.getHome = (req, res, next) => {
  if (req.user.workplace === "vrchlabi" || req.user.workplace === "vse") {
    return res.redirect("/vrchlabi");
  }
  if (req.user.workplace === "dvur") {
    return res.redirect("/dvur");
  }
  if (req.user.workplace === "hradec") {
    return res.redirect("/hradec");
  }
  if (req.user.workplace === "trutnov") {
    return res.redirect("/trutnov");
  }
};

exports.getVrchlabi = (req, res, next) => {
  if (req.user.workplace === "vse" || req.user.workplace === "vrchlabi") {
    var dateNoow = new Date();
    dateNoow = moment(dateNoow)
      .add(3600000, "ms")
      .toDate();

    return Event.find({ toDate: { $gt: dateNoow }, access: "vrchlabi" }).then(
      events => {
        if (!events) {
          return next();
        }
        // console.log('Hledám podle tohodle data', dateNoow);
        let sortedEvents = events.sort(sortUtil);
        let arrayOfDates = [];
        let formattedDatesFrom = [];
        let formattedDatesTo = [];

        for (i = 0; i < sortedEvents.length; i++) {
          var fromDate = sortedEvents[i].fromDate;
          var toDate = sortedEvents[i].toDate;

          // nezobrazovat vpravo v home datumy a počet chybějících, když mají zneplatněné nebo neschválené absence
          if (
            sortedEvents[i].responses[sortedEvents[i].responses.length - 1]
              .status !== 2 &&
            sortedEvents[i].responses[sortedEvents[i].responses.length - 1]
              .status !== 3
          ) {
            // console.log(sortedEvents[i].responses[sortedEvents[i].responses.length - 1].status);

            // najde všechny datumy, které pokrývá absence
            dateUtil.findDates(fromDate, toDate, allDatesOfEvent => {
              dateUtil.addToArrayOfDates(allDatesOfEvent, arrayOfDates);
            });
          }

          // pouhé přeformátování datumů a přidání do pole
          formattedDatesFrom.push(dateUtil.getFormattedDateWithTime(fromDate));
          formattedDatesTo.push(dateUtil.getFormattedDateWithTime(toDate));
        }

        // console.log('Arrays of Dates: ', arrayOfDates);
        return res.render("employee/home", {
          events: sortedEvents,
          workplaceOfEvent: "vrchlabi",
          workplaceOfUser: req.user.workplace,
          userIdAdded: req.user._id,
          dates: arrayOfDates,
          formatDatesFrom: formattedDatesFrom,
          formatDatesTo: formattedDatesTo,
          numOfEmployees: 15,
          csrfToken: req.csrfToken()
        });
      }
    );
  }
  next();
};

exports.getDvur = (req, res, next) => {
  if (req.user.workplace === "vse" || req.user.workplace === "dvur") {
    var dateNoow = new Date();
    dateNoow = moment(dateNoow)
      .add(3600000, "ms")
      .toDate();
    return Event.find({ toDate: { $gt: dateNoow }, access: "dvur" })
      .then(events => {
        // console.log(events);
        let sortedEvents = events.sort(sortUtil);
        let arrayOfDates = [];
        let formattedDatesFrom = [];
        let formattedDatesTo = [];

        for (i = 0; i < sortedEvents.length; i++) {
          var fromDate = sortedEvents[i].fromDate;
          var toDate = sortedEvents[i].toDate;

          if (
            sortedEvents[i].responses[sortedEvents[i].responses.length - 1]
              .status !== 2 &&
            sortedEvents[i].responses[sortedEvents[i].responses.length - 1]
              .status !== 3
          ) {
            dateUtil.findDates(fromDate, toDate, allDatesOfEvent => {
              dateUtil.addToArrayOfDates(allDatesOfEvent, arrayOfDates);
            });
          }

          formattedDatesFrom.push(dateUtil.getFormattedDateWithTime(fromDate));
          formattedDatesTo.push(dateUtil.getFormattedDateWithTime(toDate));
        }

        return res.render("employee/home", {
          events: sortedEvents,
          workplaceOfEvent: "dvur",
          workplaceOfUser: req.user.workplace,
          userIdAdded: req.user._id,
          dates: arrayOfDates,
          formatDatesFrom: formattedDatesFrom,
          formatDatesTo: formattedDatesTo,
          numOfEmployees: 11,
          csrfToken: req.csrfToken()
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
  next();
};

exports.getTrutnov = (req, res, next) => {
  if (req.user.workplace === "vse" || req.user.workplace === "trutnov") {
    var dateNoow = new Date();
    dateNoow = moment(dateNoow)
      .add(3600000, "ms")
      .toDate();
    return Event.find({ toDate: { $gt: dateNoow }, access: "trutnov" }).then(
      events => {
        let sortedEvents = events.sort(sortUtil);
        let arrayOfDates = [];
        let formattedDatesFrom = [];
        let formattedDatesTo = [];

        for (i = 0; i < sortedEvents.length; i++) {
          var fromDate = sortedEvents[i].fromDate;
          var toDate = sortedEvents[i].toDate;

          if (
            sortedEvents[i].responses[sortedEvents[i].responses.length - 1]
              .status !== 2 &&
            sortedEvents[i].responses[sortedEvents[i].responses.length - 1]
              .status !== 3
          ) {
            dateUtil.findDates(fromDate, toDate, allDatesOfEvent => {
              dateUtil.addToArrayOfDates(allDatesOfEvent, arrayOfDates);
            });
          }

          formattedDatesFrom.push(dateUtil.getFormattedDateWithTime(fromDate));
          formattedDatesTo.push(dateUtil.getFormattedDateWithTime(toDate));
        }
        return res.render("employee/home", {
          events: sortedEvents,
          workplaceOfEvent: "trutnov",
          workplaceOfUser: req.user.workplace,
          userIdAdded: req.user._id,
          dates: arrayOfDates,
          // dates: undefined,
          formatDatesFrom: formattedDatesFrom,
          formatDatesTo: formattedDatesTo,
          numOfEmployees: 15,
          csrfToken: req.csrfToken()
        });
      }
    );
  }
  next();
};

exports.getHradec = (req, res, next) => {
  if (req.user.workplace === "vse" || req.user.workplace === "hradec") {
    var dateNoow = new Date();
    dateNoow = moment(dateNoow)
      .add(3600000, "ms")
      .toDate();
    return Event.find({ toDate: { $gt: dateNoow }, access: "hradec" }).then(
      events => {
        let sortedEvents = events.sort(sortUtil);
        let arrayOfDates = [];
        let formattedDatesFrom = [];
        let formattedDatesTo = [];

        for (i = 0; i < sortedEvents.length; i++) {
          var fromDate = sortedEvents[i].fromDate;
          var toDate = sortedEvents[i].toDate;

          if (
            sortedEvents[i].responses[sortedEvents[i].responses.length - 1]
              .status !== 2 &&
            sortedEvents[i].responses[sortedEvents[i].responses.length - 1]
              .status !== 3
          ) {
            dateUtil.findDates(fromDate, toDate, allDatesOfEvent => {
              dateUtil.addToArrayOfDates(allDatesOfEvent, arrayOfDates);
            });
          }

          formattedDatesFrom.push(dateUtil.getFormattedDateWithTime(fromDate));
          formattedDatesTo.push(dateUtil.getFormattedDateWithTime(toDate));
        }
        return res.render("employee/home", {
          events: sortedEvents,
          workplaceOfEvent: "hradec",
          workplaceOfUser: req.user.workplace,
          userIdAdded: req.user._id,
          dates: arrayOfDates,
          formatDatesFrom: formattedDatesFrom,
          formatDatesTo: formattedDatesTo,
          numOfEmployees: 17,
          csrfToken: req.csrfToken()
        });
      }
    );
  }
  next();
};

exports.getEvent = (req, res, next) => {
  const eventId = req.params.eventId;
  Event.findOne({ _id: eventId })
    .then(eventDoc => {
      if (!eventDoc) {
        return next();
      }
      // podmínka, která slouží k autentifikaci
      if (
        eventDoc.userId.toString() === req.user._id.toString() ||
        req.user.workplace === "vse"
      ) {
        let dateOfCreate = dateUtil.getFormattedDateWithTime(
          eventDoc.createDate
        );
        let dateFrom = dateUtil.getFormattedDateWithTime(eventDoc.fromDate);
        let dateTo = dateUtil.getFormattedDateWithTime(eventDoc.toDate);
        let statusDates = [];
        // do pole statusDates ukládám datumy všech akcí absence, jako je schválení, neschválení, zrušení
        for (let i = 0; i < eventDoc.responses.length; i++) {
          if (eventDoc.responses[i].status !== 0) {
            statusDates.push(
              dateUtil.getFormattedDateWithTime(eventDoc.responses[i].date)
            );
          }
        }
        return res.render("employee/event", {
          event: eventDoc,
          datesOfResponses: statusDates,
          workplaceOfUser: req.user.workplace,
          createdAt: dateOfCreate,
          dateFrom,
          dateTo,
          csrfToken: req.csrfToken()
        });
      }
      next();
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getAddEvent = (req, res, next) => {
  var q = new Date();
  q = moment(q)
    .add(3600000, "ms")
    .toDate();
  var m = dateUtil.checkLength(q.getMonth() + 1);
  var d = dateUtil.checkLength(q.getDate());
  var y = dateUtil.checkLength(q.getFullYear());
  // var hs = dateUtil.checkLength(q.getHours());
  // var mts = dateUtil.checkLength(q.getMinutes());
  var dateFrom = y + "-" + m + "-" + d + "T00:00";
  var dateTo = y + "-" + m + "-" + d + "T23:55";
  //date = '2020-01-26T15:57';
  //console.log(date);
  //console.log(dateFrom);
  //console.log(dateTo);
  res.render("employee/add-event", {
    workplaceOfUser: req.user.workplace,
    errorMessage: undefined,
    oldInput: undefined,
    dateFrom: dateFrom,
    dateTo: dateTo,
    csrfToken: req.csrfToken()
  });
};

exports.postAddEvent = (req, res, next) => {
  // var from = new Date(2020, 01, 01, 00, 01);
  // const from = new Date(req.body.from);
  // const to = new Date(req.body.to);
  const desc = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //console.log(errors.array());
    var q = new Date();
    q = moment(q)
      .add(3600000, "ms")
      .toDate();
    var m = dateUtil.checkLength(q.getMonth() + 1);
    var d = dateUtil.checkLength(q.getDate());
    var y = dateUtil.checkLength(q.getFullYear());
    var dateFrom = y + "-" + m + "-" + d + "T00:00";
    var dateTo = y + "-" + m + "-" + d + "T23:55";
    return res.render("employee/add-event", {
      workplaceOfUser: req.user.workplace,
      errorMessage: errors.array()[0].msg,
      oldInput: req.body.description,
      dateFrom: dateFrom,
      dateTo: dateTo,
      csrfToken: req.csrfToken()
    });
  }
  // console.log(to, desc, new Date(), req.user.workplace, req.user._id);
  // next();
  //   if (to >= from && to >= new Date()) {
  var idEvent = mongoose.Types.ObjectId();
  var dateNoow = new Date();
  dateNoow = moment(dateNoow)
    .add(3600000, "ms")
    .toDate();

  const event = new Event({
    _id: idEvent,
    createDate: dateNoow,
    fromDate: req.body.from,
    toDate: req.body.to,
    description: desc,
    access: req.user.workplace,
    userId: req.user._id,
    firstNameWas: req.user.firstName,
    lastNameWas: req.user.lastName,
    emailOfCreator: req.user.email,
    responses: [
      {
        status: 0
      }
    ]
  });
  event
    .save()
    .then(saved => {
      if (saved) {
        //pak smazat return
        res.redirect("/");
        var workplaceName;
        if (req.user.workplace === "vrchlabi") {
          workplaceName = "Vrchlabí";
        } else if (req.user.workplace === "dvur") {
          workplaceName = "Dvůr Králové nad Labem";
        } else if (req.user.workplace === "hradec") {
          workplaceName = "Hradec Králové";
        } else if (req.user.workplace === "trutnov") {
          workplaceName = "Trutnov";
        }

        return transporter.sendMail({
          // to: "gortozcze@gmail.com",
          to: process.env.RECEIVING_EMAIL,
          from: "kalendar.skolavrchlabi@gmail.com",
          subject: "Nová absence",
          html: `
                <p>Byla přidána nová absence.</p>
                <p>Pracoviště: ${workplaceName}</p>
                <p>Pro detail klikni <a href="${process.env.BACKEND_URL}/event/${idEvent}">zde</a></p>
                `
        });
      }
      res.redirect("/123");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postResponse = (req, res, next) => {
  const whoN = req.user.firstName;
  const whoL = req.user.lastName;
  const note = req.body.note;
  const eventId = req.body.eventId;
  const approve = req.body.approve;
  let currentStatus = 0;
  let subjectOfMail = "subject";
  let creatorsNoteOfEvent = "";
  let schvalNeschval = "";
  let sendTo = "";
  Event.findOne({ _id: eventId })
    .then(eventDoc => {
      if (!eventDoc) {
        return next();
      }
      currentStatus = eventDoc.responses[eventDoc.responses.length - 1].status;
      if (currentStatus === 3) {
        let errorUrl = "/event/" + eventDoc._id.toString();
        return res.redirect(errorUrl);
      }
      creatorsNoteOfEvent = eventDoc.description;
      sendTo = eventDoc.emailOfCreator;
      var dateNoow = new Date();
      dateNoow = moment(dateNoow)
        .add(3600000, "ms")
        .toDate();

      let response = {
        firstName: whoN,
        lastName: whoL,
        note: note,
        date: dateNoow
      };
      if (approve === "yes") {
        response.status = 1;
        subjectOfMail = "Absence schválena";
        schvalNeschval = "SCHVÁLENA.";
        if (currentStatus === 1) {
          let errorUrl = "/event/" + eventDoc._id.toString();
          return res.redirect(errorUrl);
        }
      } else {
        response.status = 2;
        subjectOfMail = "Absence neschválena";
        schvalNeschval = "NESCHVÁLENA.";
        if (currentStatus === 2) {
          let errorUrl = "/event/" + eventDoc._id.toString();
          return res.redirect(errorUrl);
        }
      }

      let newResponoses = eventDoc.responses;
      newResponoses.push(response);
      eventDoc.responses = newResponoses;
      return eventDoc.save();
    })
    .then(saved => {
      if (saved) {
        const url = "/event/" + eventId;
        res.redirect(url);
        return transporter.sendMail({
          to: sendTo,
          from: "kalendar.skolavrchlabi@gmail.com",
          subject: subjectOfMail,
          html: `
            <p>Absence s důvodem: "${creatorsNoteOfEvent}" byla ${schvalNeschval}</p>
            <p>Pro detail klikni <a href="${process.env.BACKEND_URL}/event/${eventId}">zde</a></p>
            `
        });
      }
      return next();
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postInvalidate = (req, res, next) => {
  const whoN = req.user.firstName;
  const whoL = req.user.lastName;
  const note = req.body.note;
  const eventId = req.body.eventId;
  const approve = req.body.approve;
  let creatorsNoteOfEvent = "";
  Event.findOne({ _id: eventId })
    .then(eventDoc => {
      if (!eventDoc) {
        return next();
      }
      creatorsNoteOfEvent = eventDoc.description;
      // měním čas o hodinu kvůli serveru
      var dateNoow = new Date();
      dateNoow = moment(dateNoow)
        .add(3600000, "ms")
        .toDate();
      let response = {
        firstName: whoN,
        lastName: whoL,
        note: note,
        date: dateNoow,
        status: 3
      };
      let newResponoses = eventDoc.responses;
      newResponoses.push(response);
      eventDoc.responses = newResponoses;
      return eventDoc.save();
    })
    .then(saved => {
      const url = "/event/" + eventId;
      res.redirect(url);
      return transporter.sendMail({
        to: process.env.RECEIVING_EMAIL,
        // to: "gortozcze@gmail.com",
        from: "kalendar.skolavrchlabi@gmail.com",
        subject: "Absence zrušena",
        html: `
        <p>Absence s důvedem: "${creatorsNoteOfEvent}" byla zrušena.</p>
        <p>Kým: ${whoN} ${whoL}</p>
        <p>Poznamka: ${note}</p>
        <p>Pro detail klikni <a href="${process.env.BACKEND_URL}/event/${eventId}">zde</a></p>
        `
      });
    })
    .catch(err => {
      console.log(err);
    });
};
