/* jshint node: true */

//************************************************************
//  resultModel.js                                          //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 04/12/2017.                 //
//  Copyright © 2017 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  04/12/17    O. Miz      Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResultSchema = new Schema({
    student_id: {
        type: String,
        required: true
    },
    question_id: {
        type: String,
        required: true
    },
    course_oid: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    },
    question_oid: {
        type: Schema.Types.ObjectId,
        ref: 'Result'
    },
    lecture_id: {
        type: String,
        required: true
    },
    lecture_oid: { type: Schema.Types.ObjectId, ref: 'Lecture' },
    answer: {
        type: String,
        required: true
    },
    correct: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Result', ResultSchema);
