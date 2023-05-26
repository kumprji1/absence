const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
    createDate: {
        type: Date,
        required: true
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    access: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    firstNameWas: {
        type: String,
        required: true
    },
    lastNameWas: {
        type: String,
        required: true
    },
    emailOfCreator: {
        type: String,
        required: true
    },
    responses: 
        [
            {
                status: {
                    type: Number
                },
                firstName: {
                    type: String
                },
                lastName: {
                    type: String
                },
                date: {
                    type: Date
                },
                note: {
                    type: String
                }
            }
        ]       
});

module.exports = mongoose.model('Event', eventSchema);