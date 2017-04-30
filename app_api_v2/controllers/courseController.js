/* jshint node: true */
/* jshint esversion: 6 */

//************************************************************
//  courseController.js                                     //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 01/07/17.                   //
//  Copyright © 2017 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  07Jan17     O. Mizrahi  Initial Design                  //
//                                                          //
//************************************************************
"use strict";

<<<<<<< HEAD
var User = require('./../models/userModel');
var Course = require('./../models/courseModel');
var Section = require('./../models/sectionModel');
var rand = require("random-key");
var bcrypt = require('bcryptjs');
=======
var User = require('./../models/userModel'),
    mongoose = require('mongoose'),
    Course = require('./../models/courseModel'),
    Section = require('./../models/sectionModel'),
    rand = require('random-key'),
    winston = require('winston'),
    bcrypt = require('bcryptjs');
>>>>>>> master

var roles = {
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor',
    STUDENT: 'student',
};

Array.prototype.studentCourseAvg = function(student_id) {
    if (this.length === 0) {
        return 100;
    }
    else {
        var counter = 0;
        for(var i = 0; i < this.length; i++) {
          if(this[i].correct && this[i].student_id === student_id) {
            counter++;
          }
        }
        return Math.round((counter / this.length) * 100);
      }
 };

 Array.prototype.courseAvg = function() {
    if (this.length === 0) {
        return 100;
    }
    else {
        var counter = 0;
        for(var i = 0; i < this.length; i++) {
          if(this[i].correct) {
            counter++;
          }
        }
        return Math.round((counter / this.length) * 100);
      }
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

var instructorAddStudent = function(req, res, next) {
    winston.info('courseController: instructor add student: %s', req.body.username);

    var newStudent;
    var student_status;

    User.findOne({
            username: req.body.username
        })
        .exec()
        //Check if student has a user account
        .then(function(user) {
            if (!user) {
                //student not found, create student account
                student_status = "pending";
                var password = rand.generate();

                var pre_registered = {
                    password: password,
                    course_id: req.params.COURSEID,
                    section_id: req.params.SECTIONID
                };

                var newUser = new User({
                    username: req.body.username,
                    password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    role: roles.STUDENT,
                    register_status: student_status,
                    pre_register_key: password,
                    pre_registered: pre_registered
                });
                return newUser.save();
            } else {
                //student already registered
                student_status = "complete";
                return user;
            }
        })
        //save new student and get course
        .then(function(user) {
            newStudent = {
                student_id: user._id.toString(),
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                status: student_status
            };
            return Course.update({_id: req.params.COURSEID},
                                {$addToSet: {students: newStudent.username}
            });
        })
        //check if student is already in course
        .then(function(result) {
            return new Promise((resolve, reject) => {
                //if nModified equals 0 then student is already in course
                if (result.nModified === 0) {
                    var error_message = new Error('Student Already in Course');
                    reject(error_message);
                } else {
                    resolve(result);
                }
            });
        })
        //add student to section
        .then(function(result) {
            return Section.update({_id: req.params.SECTIONID},
                                  {$addToSet: {students: newStudent}
            });
        })
        .then(function(result) {
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                message: 'Student Added to Course',
                student_username: newStudent.username
            });
        })
        .catch(function(err) {
            return res.status(500).json({
                success: false,
                message: err.message,
                student_username: req.body.username
            });
        });
};

var updateStudentStatus = function(req, res, next) {
    winston.info('courseController: update student status');

    if (req.user.register_status === "pending") {
        var course_id = req.user.pre_registered.course_id;
        var section_id = req.user.pre_registered.section_id;
        var key = req.user.pre_registered_key;

        req.user.pre_registered = undefined;
        req.user.pre_registered_key = undefined;
        req.user.register_status = "complete";

        req.user.save()
        .then(function(user) {
            return Section.findOneAndUpdate({_id: section_id,"students.student_id": req.user._id.toString()},
                                            {$set: {"students.$.status": "complete"}},
                                            {new: true});
        })
        .then(function(section) {
            next();
        })
        .catch(function(err) {
            return res.status(401).json({
                success: false,
                message: 'Pre Registration Not Complete'
            });
        });
    }
    else {
        next();
    }
};

var joinCourse = function(req, res, next) {
    winston.info('courseController: join course');

    var sectionKey = req.body.section_key;
    var courseKey = sectionKey.slice(0, sectionKey.indexOf('-'));
    var studentToAdd;

    User.findById(req.decodedToken.sub)
        .exec()
        .then(function(user) {
            req.username = user.username;
            studentToAdd = {
                student_id: user._id.toString(),
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                status: "complete"
            };
            //attempting to add student to course students array
            return Course.update({
                course_key: courseKey
            }, {
                $addToSet: {
                    students: studentToAdd.username
                }
            });
            //return Course.findOne({course_key: courseKey, students: {$nin: [studentToAdd.username]}});
        })
        .then(function(result) {
            return new Promise((resolve, reject) => {
                //if nModified equals 0 then student is already in course
                if (result.nModified === 0) {
                    var error_message = new Error('Student Already in Course');
                    reject(error_message);
                } else {
                    resolve(result);
                }
            });
        })
        .then(function(result) {
            return Section.findOneAndUpdate({
                section_key: sectionKey
            }, {
                $addToSet: {
                    students: studentToAdd
                }
            }, {
                new: true
            });
        })
        .then(function(result) {
            next();
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        });
};

var deleteStudentFromCourse = function(req, res) {
    winston.info('courseController: instructor delete student from course');

    var student;

    User.findById(req.params.USERID)
        .exec()
        .then(function(user) {
            student = user.username;
            return Section.findOneAndUpdate({
                _id: req.params.SECTIONID
            }, {
                $pull: {
                    students: {
                        student_id: req.params.USERID
                    }
                }
            }, {
                new: true
            });
        })
        .then(function(section) {
            return Course.findOneAndUpdate({
                _id: req.params.COURSEID
            }, {
                $pull: {
                    students: student
                }
            }, {
                new: true
            });
        })
        .then(function(course) {
            return Course.aggregate([
                {$match: {"_id": course._id}},
                {$lookup:
                  {from: "sections", localField: "_id", foreignField: "course_oid", as: "sections"}
                },
                {$lookup:
                  {from: "lectures", localField: "_id", foreignField: "course_oid", as: "lectures"}
                }
        ]);
        })
        .then(function(courses) {
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                message: 'Student Deleted',
                course: courses[0]
            });
        })
        .catch(function(err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        });
};

var getCourse = function(req, res) {
    winston.info('courseController: get course info');

    // Course.findById(req.params.COURSEID)
    //     .exec()
    //     .then(function(course) {
    //         return Course.aggregate([
    //             {$match: {_id: course._id}},
    //             {$lookup: {from: "sections", localField: "_id", foreignField: "course_oid", as: "sections"}},
    //             {$lookup: {from: "lectures", localField: "_id", foreignField: "course_oid", as: "lectures"}},
    //             { $project:
    //               { "title": 1, "course_key": 1, "createdAt": 1, "schedule": 1, "students": 1, "instructor": 1,
    //                 "lectures.title": 1, "lectures.course_id": 1, "lectures.schedule": 1, "lectures.post_lecture": 1, "lectures.live": 1,
    //                 "sections": 1
    //               }
    //             }
    //     ]);
    //     })
    //     .then(function(courses) {
    //         return res.status(200).json({
    //             success: true,
    //             jwt_token: req.token,
    //             message: 'Request Success',
    //             course: courses[0]
    //         });
    //     })
    //     .catch(function(err) {
    //         return res.status(404).json({
    //             success: false,
    //             message: 'Course Not Found'
    //         });
    //     });
    if (req.decodedToken.role === roles.STUDENT) {

        User.findById(req.decodedToken.sub).exec().then(function(user){
            Course.aggregate([
                {$match: {"_id": mongoose.Types.ObjectId(req.params.COURSEID), "students": user.username}},
                {$lookup: {from: "results", localField: "_id", foreignField: "course_oid", as: "results"}},
                {$lookup: {from: "lectures", localField: "_id", foreignField: "course_oid", as: "lectures"}},
                {$lookup: {from: "sections", localField: "_id", foreignField: "course_oid", as: "sections"}},
                {$unwind: "$sections"},
                {$unwind: "$sections.students"},
                {$match: {"sections.students.student_id": req.decodedToken.sub}},
                { $project:
                  { "title": 1, "schedule": 1, "instructor": 1,
                    "lectures._id": 1, "lectures.title": 1, "lectures.course_id": 1, "lectures.schedule": 1, "lectures.post_lecture": 1, "lectures.live": 1,
                    "results.correct": 1, "results.student_id": 1, "section": "$sections.name", "numOfStudents": { "$size": "$students" }
                  }
                }
            ])
            .then(function(courses) {
                courses[0].average = courses[0].results.studentCourseAvg(req.decodedToken.sub);
                return res.status(201).json({
                    success: true,
                    jwt_token: req.token,
                    message: 'Request Success',
                    courses: courses
                });
            })
            .catch(function(err) {
                return res.status(404).json({
                    success: false,
                    message: err.message
                });
            });
        });
    } else {
        Course.aggregate([
                {$match: {"_id": mongoose.Types.ObjectId(req.params.COURSEID), "instructor.instructor_id": req.decodedToken.sub}},
                {$lookup: {from: "sections", localField: "_id", foreignField: "course_oid", as: "sections"}},
                {$lookup: {from: "lectures", localField: "_id", foreignField: "course_oid", as: "lectures"}},
                {$lookup: {from: "results", localField: "_id", foreignField: "course_oid", as: "results"}},
                { $project:
                  {
                    "_id": 1, "title": 1, "course_key": 1, "createdAt": 1, "schedule": 1, "students": 1, "instructor": 1, "sections": 1, "lectures": 1, "results.correct": 1
                  }
                }
        ])
        .then(function(courses) {
            courses.forEach(function(course) {
                course.class_average = course.results.courseAvg();
            });
            return res.status(201).json({
                success: true,
                jwt_token: req.token,
                message: 'Request Success',
                courses: courses
            });
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: 'No Courses Found'
            });
        });
    }
};

var getUserCourses = function(req, res) {
    winston.info('courseController: get user courses');

    if (req.decodedToken.role === roles.STUDENT) {

        User.findById(req.decodedToken.sub).exec().then(function(user){
            Course.aggregate([
                {$match: {"students": user.username}},
                {$lookup: {from: "results", localField: "_id", foreignField: "course_oid", as: "results"}},
                {$lookup: {from: "lectures", localField: "_id", foreignField: "course_oid", as: "lectures"}},
                {$lookup: {from: "sections", localField: "_id", foreignField: "course_oid", as: "sections"}},
                {$unwind: "$sections"},
                {$unwind: "$sections.students"},
                {$match: {"sections.students.student_id": req.decodedToken.sub}},
                { $project:
                  { "title": 1, "schedule": 1, "instructor": 1,
                    "lectures._id": 1, "lectures.title": 1, "lectures.course_id": 1, "lectures.schedule": 1, "lectures.post_lecture": 1, "lectures.live": 1,
                    "results.correct": 1, "results.student_id": 1, "section": "$sections.name", "numOfStudents": { "$size": "$students" }
                  }
                }
            ])
            .then(function(courses) {
                courses.forEach(function(course) {
                    course.average = course.results.studentCourseAvg(req.decodedToken.sub);
                });
                return res.status(201).json({
                    success: true,
                    jwt_token: req.token,
                    message: 'Request Success',
                    courses: courses
                });
            })
            .catch(function(err) {
                return res.status(404).json({
                    success: false,
                    message: err.message
                });
            });
        });
    } else {
        Course.aggregate([
                {$match: {"instructor.instructor_id": req.decodedToken.sub}},
                {$lookup: {from: "sections", localField: "_id", foreignField: "course_oid", as: "sections"}},
                {$lookup: {from: "lectures", localField: "_id", foreignField: "course_oid", as: "lectures"}},
                {$lookup: {from: "results", localField: "_id", foreignField: "course_oid", as: "results"}},
                { $project:
                  {
                    "_id": 1, "title": 1, "course_key": 1, "createdAt": 1, "schedule": 1, "students": 1, "instructor": 1, "sections": 1, "lectures": 1, "results.correct": 1
                  }
                }
        ])
        .then(function(courses) {
            courses.forEach(function(course) {
                course.class_average = course.results.courseAvg();
            });
            return res.status(201).json({
                success: true,
                jwt_token: req.token,
                message: 'Request Success',
                courses: courses
            });
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: 'No Courses Found'
            });
        });
    }
};

var savedCourseToDB = function(req, res) {
    winston.info('courseController: save course to database');

    User.findById(req.decodedToken.sub)
        .exec()
        .then(function(user) {
            var course_instructor = {
                instructor_id: user._id.toString(),
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                photo: "user.photo"
            };
            var newCourse = new Course({
                title: req.body.title,
                instructor: course_instructor,
                schedule: req.body.course_schedule,
                course_key: rand.generate()
            });
            return newCourse.save();
        })
        .then(function(course) {
            for (var i = 0; i < req.body.sections.length; i++) {
                req.body.sections[i].section_key = course.course_key + '-' + rand.generate();
                req.body.sections[i].course_id = course._id.toString();
                req.body.sections[i].course_oid = course._id;
            }
            return Section.insertMany(req.body.sections);
        })
        .then(function(sections) {
            return Course.aggregate([
                    {$match: {"instructor.instructor_id": req.decodedToken.sub}},
                    {$lookup: {from: "sections", localField: "_id", foreignField: "course_oid", as: "sections"}},
                    {$lookup: {from: "lectures", localField: "_id", foreignField: "course_oid", as: "lectures"}},
                    {$lookup: {from: "results", localField: "_id", foreignField: "course_oid", as: "results"}},
                    { $project:
                      {
                        "_id": 1, "title": 1, "course_key": 1, "createdAt": 1, "schedule": 1, "students": 1, "instructor": 1, "sections": 1, "lectures": 1, "results.correct": 1
                      }
                    }
            ]);
        })
        .then(function(courses) {
            courses.forEach(function(course) {
                course.class_average = course.results.courseAvg();
            });
            console.log(courses);
            return res.status(201).json({
                success: true,
                jwt_token: req.token,
                message: 'Course Creation Successsful',
                courses: courses
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
    deleteStudentFromCourse: deleteStudentFromCourse,
    getCourse: getCourse,
    getUserCourses: getUserCourses,
    instructorAddStudent: instructorAddStudent,
    joinCourse: joinCourse,
    savedCourseToDB: savedCourseToDB,
    updateStudentStatus: updateStudentStatus
};
