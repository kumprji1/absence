const path = require('path');
const User = require('../models/user');
const Event = require('../models/event');
const { body } = require('express-validator');
const moment = require('moment');

const express = require('express');

const employeeController = require('../controllers/employee');
const isAuth = require('../middleware/is-auth');
const isVerified = require('../middleware/is-verified');

const router = express.Router();

router.post('/invalidate', isAuth, isVerified, employeeController.postInvalidate);

router.post('/response', isAuth, isVerified, employeeController.postResponse);

router.get('/event/:eventId', isAuth, isVerified, employeeController.getEvent);

router.get('/add-event', isAuth, isVerified, employeeController.getAddEvent);

router.post('/add-event', [
    body('description')
    .custom((value, { req }) => {
         if (!value) {
             throw new Error('Chybí popis. Zadejte znovu datum.');
         }
        return true;
    }),
    body('from')
    .custom((value, { req }) => {
        if (!value) {
            throw new Error('Zadejte datum');
        }
        const fromD = new Date(value);
        // console.log(+fromD.getUTCFullYear());
        if (!(fromD.getFullYear() >= 2000 && fromD.getFullYear() <= 2060)) {
            throw new Error('Zadejte platný rok (od)');
        }
        // console.log(value);
        const toD = new Date(req.body.to);
         if (toD < fromD) {
             throw new Error('Datum do kdy, nesmí být starší než datum od kdy');
         }
        return true;
    }),
    body('to')
    // ověřit, jestli je to platné datum
    .custom((value, { req }) => {
        if (!value) {
            throw new Error('Zadejte datum');
        }
        const toD = new Date(value);
        // console.log(+toD.getUTCFullYear());
        if (!(toD.getFullYear() >= 2000 && toD.getFullYear() <= 2060)) {
            throw new Error('Zadejte platný rok (do)');
        }

        if (toD < moment(new Date()).add(3600000).toDate()) {
            throw new Error('Návrat do minulosti zakázán');
        }
        return true;
    })
], isVerified, employeeController.postAddEvent);

router.get('/home', isAuth, isVerified, employeeController.getHome);

router.get('/vrchlabi', isAuth, isVerified, employeeController.getVrchlabi);

router.get('/dvur', isAuth, isVerified, employeeController.getDvur);

router.get('/hradec', isAuth, isVerified, employeeController.getHradec);

router.get('/trutnov', isAuth, isVerified, employeeController.getTrutnov);

router.get('/', isAuth, isVerified, employeeController.getHome);

module.exports = router;
