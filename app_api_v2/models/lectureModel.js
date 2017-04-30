/* jshint node: true */

//************************************************************
//  lectureModel.js                                         //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 03/04/2017.                 //
//  Copyright © 2017 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  03/02/05    O. Miz      Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var student_data = {
    student_id: String,
    score: String
};

var question_snapshot = {
    question_id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true,
        lowercase: true
    },
    copied: {
        type: Boolean,
        required: true
    },
    "_id": false
};

var LectureSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    live: {
        type: Boolean,
        default: false
    },
    post_lecture: {
        type: Boolean,
        default: false
    },
    course_id: {
        type: String,
        required: true
    },
    course_oid: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    },
    instructor_id: {
        type: String,
        required: true
    },
    questions: [question_snapshot],
    schedule: {
        day: {
            type: String,
            enum: ['mon', 'tue', 'wed', 'thu', 'fri']
        },
        date: String
    }
});

module.exports = mongoose.model('Lecture', LectureSchema);
