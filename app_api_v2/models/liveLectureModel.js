/* jshint node: true */

//************************************************************
//  liveLectureModel.js                                     //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 04/10/2017.                 //
//  Copyright © 2017 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  04/10/17    O. Miz      Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LiveLectureSchema = new Schema({
    lecture_id: {
        type: String,
        required: true,
        unique: true
    },
    course_oid: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    },
    instructor_socket: {
        type: String,
        required: true,
        unique: true
    },
    current_question: {
        type: Object
    }
});

module.exports = mongoose.model('LiveLecture', LiveLectureSchema);
