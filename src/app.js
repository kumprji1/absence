const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const helmet = require('helmet');
const compression = require('compression');
const moment = require('moment');
const serverless = require('serverless-http')

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-sptrm.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;
//`mongodb+srv://school:4eFmWw5I7hNEJUaa@cluster0-sptrm.mongodb.net/calendar?retryWrites=true&w=majority`;

const app = express();
const store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: 'sessions',
});

const csrfProtection = csrf();

// var dateNoow = new Date();
// dateNoow = moment(dateNoow).add(3600000, 'ms').toDate();
// console.log(dateNoow);

const errorController = require('./controllers/error');
const User = require('./models/user');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employee');

app.set('view engine', 'ejs');
app.set('views', './src/views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
	session({
		secret: 'my secret',
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);

app.use(csrfProtection);

// app.use((req, res, next) => {
//   res.locals.isAuthenticated = req.session.isLoggedIn;
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });

app.use((req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
		.then((user) => {
			req.user = user;
			next();
		})
		.catch((err) => console.log(err));
});

app.use('/.netlify/functions/app', authRoutes, employeeRoutes, errorController.get404Page);
// app.use('/.netlify/functions/api', employeeRoutes);
// app.use('/.netlify/functions/api', errorController.get404Page);

app.use((error, req, res, next) => {
	console.log("Heroku22")
	res.status(500).render('404');
});

app.use(helmet());
app.use(compression());
mongoose
	.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then((result) => {
		app.listen(process.env.PORT || 3000);
	})
	.catch((err) => {
		console.log(err);
	});

module.exports.handler = serverless(app)
