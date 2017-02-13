/* jshint node: true */

//************************************************************
//  courseModel.js                                          //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 11/17/16.                   //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  17Nov16     O. Mizrahi  Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var schedule =
{
    semester:
    {
        type      : String,
        required  : true
    },
    days: {
        type: [{ type: String, enum: ['mon', 'tue', 'wed', 'thr', 'fri'] }]
    },
    time    :
    {
        type      : String,
        required  : true
    }
};

var instructor =
{
    instructor_id  :  String,
    username       :  String,
    firstname      :  String,
    lastname       :  String
};

var lecture_snapshot =
{
    instructor_id  :  String,
    title          :  String,
    date           :  String
};

var StudentSchema  = new Schema(
{
    student_id     :  {type: String, required: true},
    username       :  {type: String, required: true},
    firstname      :  {type: String, required: true},
    lastname       :  {type: String, required: true},
    status         :  {type: String, enum: ['pending', 'complete'], default: 'pending'},
    average        :  {type: Number, default: 0},
    join_date      :  {type: Date, default : Date.now},
    "_id": false
});

var QuestionSchema  = new Schema(
{
    question_num: Number,
    question_body: String,
    answer_choices: [String],
    answer: Number
});

var LectureSchema  = new Schema(
{
    lecture_num: Number,
    title: String,
    day: String,
    inSession: Boolean,
    questions: [QuestionSchema]
});

var SectionSchema  = new Schema(
{
    name        :  {type: String},
    section_key :
    {
        type    : String,
        required: true,
        unique  : true
    },
    students:
    [
        StudentSchema
    ]
});

var CourseSchema  = new Schema(
{
    title:
    {
        type    : String,
        required: true
    },
    instructor:
    {
        instructor_id  :  {type: String, required: true},
        username       :  {type: String, required: true},
        firstname      :  {type: String, required: true},
        lastname       :  {type: String, required: true},
    },
    schedule:
    {
        days:
        {
            type: [{ type: String, enum: ['mon', 'tue', 'wed', 'thr', 'fri'] }]
        },
        semester: {type: String, required: true},
        time: {type: String, required: true}
    },
    sections:
    [
        SectionSchema
    ],
    createdAt:
    {
        type    : Date,
        default : Date.now
    },
    course_key:
    {
        type    : String,
        required: true,
        unique  : true
    },
    lectures:
    [
        lecture_snapshot
    ]
});

CourseSchema.methods.lectureOneQuestions = function(question_array)
{
    var question1 =
    {
        question_num: 1,
        question_body: 'this is a test question',
        answer_choices: ['a', 'b', 'c', 'd'],
        answer: 0
    };
    question_array.push(question1);
    return question_array;
};

module.exports = mongoose.model('Course', CourseSchema);
