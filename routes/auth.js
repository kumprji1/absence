const path = require('path');
const { body } = require('express-validator');
const User = require('../models/user');

const express = require('express');

const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');
const isVerified = require('../middleware/is-verified');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/reset/:token', authController.getNewPassword);

router.post(
    '/newpassword',
    [
        body('password','Heslo musí mít alespoň 5 znaků')
        .isLength({min: 5})
        .custom((value, { req }) => {
            if (value !== req.body.passwordAgain) {
                throw new Error('Hesla se musí shodovat');
            }
            return true;
        })
    
], authController.postNewPassword);

router.get('/reset', authController.getResetPassword);

router.post('/resetpassword', authController.postResetPassword);

router.get('/register', authController.getRegister);

router.post(
    '/register',
    [
        body('firstName')
            .custom((value, { req }) => {
                if (value === '') {
                    throw new Error('Zadejte jméno');
                }
                return true;
            }),
        body('lastName')
            .custom((value, { req }) => {
                if (value === '') {
                    throw new Error('Zadejte přijímení');
                }
                return true;
            }),
        body('email')
            .isEmail()
            .withMessage('Zadejte prosím správnou emailovou adresu')
            // .custom((value, { req }) => {
            //     if (value.split('@')[1] !== 'specialniskolavrchlabi.cz') {
            //         throw new Error('Adresa musí být z domény test.com');
            //     }
            //     return true;
            // })
            .custom((value, { req }) => {
                return User.findOne({ email: value })
                    .then((userDoc) => {
                        if (userDoc) {
                            return Promise.reject(
                                'Email je již registrovaný. Zadejte jiný email.'
                            );
                        }
                        return true;
                    })
            }),
        body(
            'password',
            'Prosím napište platné heslo (min. 5 znaků)'
        )
            .isLength({ min: 5 }),
        body(
            'passwordAgain'
        )
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Hesla musí být shodná');
                }
                return true
            }),
        body(
            'workplace'
            )
            .custom((value, { req }) => {
                if (value === 'no') {
                    throw new Error('Zvolte pracoviště');
                }
                return true;
            })
    ],
    authController.postRegister
);

router.get('/verify/:token', authController.getVerify);

router.post('/logout', isAuth, authController.postLogout);

module.exports = router;