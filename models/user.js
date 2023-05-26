const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    workplace: {   
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    registrationToken: String,
    isVerified: Number
});

module.exports = mongoose.model('User', userSchema);