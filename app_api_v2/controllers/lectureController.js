/* jshint node: true */
/* jshint esversion: 6 */

//************************************************************
//  lectureController.js                                    //
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

var Course = require('./../models/courseModel'),
    mongoose = require('mongoose'),
    Lecture = require('./../models/lectureModel'),
    Question = require('./../models/questionModel'),
    QuestionSet = require('./../models/questionSetModel'),
    Result = require('./../models/resultModel'),
    winston = require('winston');

Array.prototype.getLectureAvg = function() {
   var counter = 0;
   for(var i = 0; i < this.length; i++) {
     if(this[i]) {
       counter++;
     }
   }
   return Math.round((counter / this.length) * 100);
 };

var checkForNull = function(data) {
    var promise = new Promise(function(resolve, reject) {
        if (!data) {
            var error_message = new Error('Does Not Exist');
            reject(error_message);
        } else {
            resolve(data);
        }
    });
    return promise;
};

var addQuestionSet = function(req, res) {
    winston.info('lectureController: add question set');
    QuestionSet.findById(req.params.QUESTIONSETID)
        .exec()
        .then(function(questionSet) {
            return Lecture.findOneAndUpdate({
                _id: req.params.LECTUREID
            }, {
                $addToSet: {
                    questions: {
                        $each: questionSet.questions
                    }
                }
            }, {
                new: true
            });
        })
        .then(function(lecture) {
            var updatedLecture = lecture.toObject();
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                message: 'Question Set Added To Lecture',
                lecture: updatedLecture
            });
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        });
};

var addQuestionToLecture = function(req, res) {
    winston.info('lectureController: add question to lecture');

    Question.findById(req.params.QUESTIONID)
        .exec()
        .then(checkForNull)
        .then(function(question) {
            if (question.instructor_id !== req.decodedToken.sub) {
                var newQuestion = new Question({
                    title: question.title,
                    tags: question.tags,
                    instructor_id: req.decodedToken.sub,
                    html_title: question.html_title,
                    html_body: question.html_body,
                    answer_choices: question.answer_choices,
                    copied: true
                });
                return newQuestion.save();
            } else return question;
        })
        .then(function(question) {
            req.question = question;
            return Lecture.findById(req.params.LECTUREID);
        })
        .then(function(lecture) {
            var question = {
                title: req.question.title,
                question_id: req.question._id.toString(),
                tags: req.question.tags,
                copied: req.question.copied
            };
            lecture.questions.push(question);
            return lecture.save();
        })
        .then(function(lecture) {
            var updatedLecture = lecture.toObject();
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                message: 'Question Added to Lecture',
                lecture: updatedLecture
            });
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        });
};

var getLecture = function(req, res) {
    winston.info('lectureController: get lecture');

    Lecture.findById(req.params.LECTUREID, {"__v": 0})
    .exec()
    .then(checkForNull)
    .then(function(lecture) {
        return res.status(200).json({
            success: true,
            jwt_token: req.token,
            message: 'Request Success',
            lecture: lecture
        });
    })
    .catch(function(err) {
        return res.status(404).json({
            success: false,
            message: err.message
        });
    });
};

var getCourseLectures = function(req, res) {
    winston.info('lectureController: get course lectures');

    Course.aggregate([
            {$match: {"_id": req.params.COURSEID}},
            {$lookup: {from: "lectures", localField: "_id", foreignField: "course_oid", as: "lectures"}},
            { $project:
              { "lectures.title": 1,
                "lectures.instructor_id": 1,
                "lectures.course_id": 1,
                "lectures.schedule": 1,
                "lectures.post_lecture": 1,
                "lectures.live": 1,
              }
            }
    ])
    .then(function(courses) {
        return res.status(201).json({
            success: true,
            jwt_token: req.token,
            message: 'Request Success',
            lectures: courses[0].lectures
        });
    })
    .catch(function(err) {
        return res.status(404).json({
            success: false,
            message: err.message
        });
    });
};

var getAllQuestionSets = function(req, res) {
    winston.info('lectureController: get all question sets');

    QuestionSet.find({
            "instructor_id": req.params.USERID
        })
        .exec()
        .then(function(questionsets) {
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                questionsets: questionsets,
                message: "Success on getAllQuestionSets"
            });
        })
        .catch(function(err) {
            return res.status(500).json({
                success: false,
                message: 'Internal Error'
            });
        });
};

var getStudentResults = function(req, res) {
    winston.info('lectureController: get student results');

    Result.aggregate([
        {$match: {"student_id": req.params.STUDENTID, "lecture_id": req.params.LECTUREID}},
        {$lookup: {from: "questions", localField: "question_oid", foreignField: "_id", as: "question_details"}}
    ])
    .exec()
    .then(function(results) {
        return res.status(200).json({
            success: true,
            jwt_token: req.token,
            results: results,
            message: "Success on getStudentResults"
        });
    })
    .catch(function(err) {
        return res.status(500).json({
            success: false,
            message: 'Internal Error'
        });
    });
};

var getInstructorResults = function(req, res) {
    winston.info('lectureController: get instructor results');

    Result.aggregate( [
      {$match: {"lecture_id" : req.params.LECTUREID}},
      {$group : { "_id" : "$question_id", student_results: { $push: "$correct" }, student_answers: { $push: "$answer" } } }
     ])
    .exec()
    .then(function(results) {
      results.forEach(function(result) {
          result.class_average = result.student_results.getLectureAvg();
      });
        return res.status(200).json({
            success: true,
            jwt_token: req.token,
            results: results,
            message: "Success on getInstructorResults"
        });
    })
    .catch(function(err) {
        return res.status(500).json({
            success: false,
            message: 'Internal Error'
        });
    });
};


var removeQuestion = function(req, res) {
    winston.info('lectureController: remove question');

    Lecture.findByIdAndUpdate(req.params.LECTUREID, {
            $pull: {
                "questions": {
                    "question_id": req.params.QUESTIONID
                }
            }
        }, {
            new: true
        })
        .exec()
        .then(function(lecture) {
            var updatedLecture = lecture.toObject();
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                message: 'Question Removed',
                lecture: updatedLecture
            });
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        });
};

var reorderQuestion = function(req, res) {
    winston.info('lectureController: re-order question');

    Question.findById(req.params.QUESTIONID)
        .exec()
        .then(checkForNull)
        .then(function(question) {
            req.question = question;
            return Lecture.findByIdAndUpdate(req.params.LECTUREID, {
                $pull: {
                    "questions": {
                        "question_id": req.params.QUESTIONID
                    }
                }
            }, {
                new: true
            });
        })
        .then(function(lecture) {
            var question = {
                title: req.question.title,
                question_id: req.question._id.toString(),
                tags: req.question.tags,
                copied: req.question.copied
            };
            lecture.questions.splice(req.body.index, 0, question);
            return lecture.save();
        })
        .then(function(lecture) {
            var updatedLecture = lecture.toObject();
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                message: 'Reorder Complete',
                lecture: updatedLecture
            });
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        });
};

var savedLectureToDB = function(req, res) {
    winston.info('lectureController: save question to database');

    var course_oid = mongoose.Types.ObjectId(req.params.COURSEID);

    var newLecture = new Lecture({
        title: req.body.lecture_title,
        instructor_id: req.decodedToken.sub,
        course_oid: course_oid,
        course_id: req.params.COURSEID,
        schedule: req.body.lecture_schedule
    });

    newLecture.save()
    .then(function(lecture) {
        return Course.aggregate([
                {$match: {"_id": course_oid}},
                {$lookup: {from: "lectures", localField: "_id", foreignField: "course_oid", as: "lectures"}},
                { $project:
                  { "lectures._id": 1,
                    "lectures.title": 1,
                    "lectures.instructor_id": 1,
                    "lectures.course_id": 1,
                    "lectures.schedule": 1,
                    "lectures.post_lecture": 1,
                    "lectures.live": 1,
                  }
                }
        ]);
    })
    .then(function(courses) {
        return res.status(201).json({
            success: true,
            jwt_token: req.token,
            message: 'Lecture Creation Successsful',
            lectures: courses[0].lectures
        });
    })
    .catch(function(err) {
        return res.status(404).json({
            success: false,
            message: err.message
        });
    });
};

var saveQuestionSet = function(req, res) {
    winston.info('lectureController: save question set');

    Lecture.findById(req.params.LECTUREID)
        .exec()
        .then(function(lecture) {
            var questions = [];
            for (var i = 0; i < lecture.questions.length; i++) {
                questions.push(lecture.questions[i]);
            }
            return questions;
        })
        .then(function(questions) {
            var newQuestionSet = new QuestionSet({
                title: req.body.title,
                instructor_id: req.decodedToken.sub,
                questions: questions
            });
            return newQuestionSet.save();
        })
        .then(function(questionSet) {
            return QuestionSet.find({
                "instructor_id": req.decodedToken.sub
            });
        })
        .then(function(questionSets) {
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                message: 'Question Set Saved',
                questionSets: questionSets
            });
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        });
};

module.exports = {
    addQuestionSet: addQuestionSet,
    addQuestionToLecture: addQuestionToLecture,
    getLecture: getLecture,
    getCourseLectures: getCourseLectures,
    getAllQuestionSets: getAllQuestionSets,
    getInstructorResults: getInstructorResults,
    getStudentResults: getStudentResults,
    removeQuestion: removeQuestion,
    reorderQuestion: reorderQuestion,
    savedLectureToDB: savedLectureToDB,
    saveQuestionSet: saveQuestionSet
};
