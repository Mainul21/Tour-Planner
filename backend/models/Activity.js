const mongoose = require('mongoose')

const ActivitySchema = new mongoose.Schema({

    title:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    Location:{
        type: String,
        required: true,
    },
    startTime:{
        type: Date,
        required: true,
    },
    endTime:{
        type: Date,
    },
    note:{
        type: String,
        trim: true,
        default: ""
    },
    category:{
        type: String,
        enum: ["food", "transportation", "accomodation", "sightseeing", "other"],
        default: "other"
    },
    tripID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Activity', ActivitySchema)