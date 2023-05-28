const User = require('../models/user');

module.exports = (req, res, next) => {
    User.findById(req.user._id)
        .then(userDoc => {
            if (!userDoc) {
                return res.redirect('/login');
            }
            if (userDoc.isVerified === 1) {
                //console.log('Puštěn do aplikace')
                return next();
            }
            return res.render('auth/notVerified',{
                csrfToken: req.csrfToken()
            });
        })
        .catch(err => {
            console.log(err);
        });
};