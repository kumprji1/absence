const moment = require('moment');
const dateUtil = require('../utils/dateUtil');

exports.getFormattedDateWithTime = (date) => {
    let fDate =
    date.getDate() + '. ' +
    (date.getMonth() + 1) + '. ' +
    date.getFullYear() + ' - ' +
    dateUtil.checkLength(date.getHours()) + ':' +
    dateUtil.checkLength(date.getMinutes());
    return fDate;
};

exports.checkLength = (number) => {
    let out = 0;
    if (number.toString().length === 1) {
        out = '0' + number.toString();
    }
    else {
        out = number.toString();
    }
    return out;
};

exports.findDates = (dateFrom, dateTo, result) => {
    let dayF = dateFrom.getDate();
    let monthF = dateFrom.getMonth();
    let yearF = dateFrom.getFullYear();
    let zF = dateFrom.getDay();

    // změna jen pro server (časová zóna)
    var q = new Date();
    q = moment(q).add(3600000, 'ms').toDate();

    var m = q.getMonth();
    var d = q.getDate();
    var y = q.getFullYear();
    var z = q.getDay();

    var dateNow = new Date(y, m, d);  //Year, Month, Date  
    var dateOne = new Date(yearF, monthF, dayF); //Year, Month, Date  
    //var dateOnePlus = moment(dateOne).add(86400000, 'ms').toDate();
    //console.log('Day now: ', dateNow);
    //console.log('Day one: ', dateOne);
    //console.log('Day one PLUS: ', dateOnePlus);
    if (dateOne > dateNow) {
        //console.log('Date One is greater than Date Now.');  
    } else {
        //console.log('Date Now is greater than Date One.');  
    }
    while (dateNow > dateOne) {
        dateOne = moment(dateOne).add(86400000, 'ms').toDate();
        //console.log('cyklus');
    }
    //console.log('Day now Aft: ', dateOne);

    dayF = dateOne.getDate();
    monthF = dateOne.getMonth();
    yearF = dateOne.getFullYear();
    zF = dateOne.getDay();


    // Chceme zobrazovat jen datumy, které jsou větší nebo rovny datu teď



    //console.log('Datum od: ', dateF);
    
    let dayT = dateTo.getDate();
    let monthT = dateTo.getMonth();
    let yearT = dateTo.getFullYear();
    let zT = dateTo.getDay();

    let dateT = {
        day: dayT,
        month: monthT,
        year: yearT,
        quantity: 1,
        dayOfWeek: zT
    };
    //console.log('Datum do: ', dateT);

    let datesIncluded = [];

    if (dayF != dayT || monthF != monthT || yearF != yearT) {
        while (dayF != dayT || monthF != monthT || yearF != yearT) {
            let dateB = {
                day: dayF,
                month: monthF,
                year: yearF,
                quantity: 1,
                dayOfWeek: zF
            };
            datesIncluded.push(dateB);
            dateOne = moment(dateOne).add(86400000, 'ms').toDate();
            dayF = dateOne.getDate();
            monthF = dateOne.getMonth();
            yearF = dateOne.getFullYear();
            zF = dateOne.getDay();
        }
        datesIncluded.push(dateT);
    } else {
        datesIncluded.push(dateT);
    }
    //console.log('Dates: ', datesIncluded);
    //console.log('Data mezi: ', datesIncluded);
    //console.log('---------------');
    result(datesIncluded);
};

exports.addToArrayOfDates = (allDatesOfEvent, arrayOfDates) => {
    var quantityAdd = false;

    allDatesOfEvent.forEach(date => {
        if (date.dayOfWeek === 0) {
            date.dayOfWeek = 'NE';
        } else if (date.dayOfWeek === 1) {
            date.dayOfWeek = 'PO';
        } else if (date.dayOfWeek === 2) {
            date.dayOfWeek = 'ÚT';
        } else if (date.dayOfWeek === 3) {
            date.dayOfWeek = 'ST';
        } else if (date.dayOfWeek === 4) {
            date.dayOfWeek = 'ČT';
        } else if (date.dayOfWeek === 5) {
            date.dayOfWeek = 'PÁ';
        } else if (date.dayOfWeek === 6) {
            date.dayOfWeek = 'SO';
        }
            quantityAdd = false;
            arrayOfDates.forEach(date2 => {
                if (date.day == date2.day && date.month == date2.month && date.year == date2.year) {
                    date2.quantity = date2.quantity + 1;
                    quantityAdd = true;
                }
            });
            if (!quantityAdd) {
                arrayOfDates.push(date);
                quantityAdd = true;
            }
        });
    if (arrayOfDates.length == 0) {
        arrayOfDates.push(...allDatesOfEvent);
    }

};