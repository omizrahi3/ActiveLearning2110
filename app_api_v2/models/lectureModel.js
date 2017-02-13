/* jshint node: true */

//************************************************************
//  lectureModel.js                                         //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 02/04/17.                   //
//  Copyright © 2017 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  04Feb17     O. Mizrahi  Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var CourseLectureSchema  = new Schema(
{
    course_id         :  {type: String, required: true},
    date:
    {
        day           : {type: String, enum: ['mon', 'tue', 'wed', 'thr', 'fri']},
        calender_date : {type: Number, min: 1, max: 31},
        time          : {type: String, required: true}
    },
});

var LectureSchema2  = new Schema(
{
    title         :  {type: String, required: true},
    instructor:
    {
        instructor_id    :  {type: String, required: true}
    },
    courses:
    [
        CourseLectureSchema
    ]
});

module.exports = mongoose.model('Lecture2', LectureSchema2);
