/* jshint node: true */

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

var User    = require('./../models/userModel');
var Course  = require('./../models/courseModel');
var rand    = require("random-key");

var roles =
{
    ADMIN       : 'admin',
    INSTRUCTOR  : 'instructor',
    STUDENT     : 'student',
};

function checkForStudent(req, res, section, student_id, callback)
{
    console.log('courseController checkForStudent');

    if (section.students === undefined || section.students === null)
    {
        callback(false);
        return;
    }
    else
    {
        for (var i = 0; i < section.students.length; i++)
        {
            if (section.students[i].student_id === student_id)
            {
                callback(true);
                return;
            }
        }
        callback(false);
    }
}

function createSectionKeys(req, res, sections, callback)
{
    console.log('courseController createSectionKeys');

    for (var i = 0; i < sections.length; i++)
    {
        sections[i].section_key = rand.generate();
    }

    callback(sections);
}

function findSectionID(req, res, sections, key, callback)
{
    console.log('courseController findSectionID');

    for (var i = 0; i < sections.length; i++)
    {
        if (sections[i].section_key === key)
        {
            callback(sections[i]._id.toString());
        }
    }
}

function findSectionIndex(req, res, sections, name, callback)
{
    console.log('courseController findSectionIndex');

    for (var i = 0; i < sections.length; i++)
    {
        if (sections[i].name === name)
        {
            callback(i);
        }
    }
}

function findStudentIndex(req, res, section, student_id, callback)
{
    console.log('courseController findStudentIndex');

    for (var i = 0; i < section.students.length; i++)
    {
        if (section.students[i].student_id === student_id)
        {
            callback(i);
        }
    }
}

var createCourse = function(req, res, next)
{
    console.log('courseController createCourse');

    User.findById(req.decodedToken.sub, function(err, user)
    {
        var newCourse = null;

        var course_instructor =
        {
            instructor_id   : user._id.toString(),
            username        : user.username,
            firstname       : user.firstname,
            lastname        : user.lastname
        };

        createSectionKeys(req, res, req.body.sections, function(sections)
        {
            newCourse = new Course(
            {
                title       : req.body.title,
                instructor  : course_instructor,
                schedule    : req.body.course_schedule,
                sections    : sections,
                course_key  : rand.generate()
            });
            newCourse.save(function(err, savedCourse)
            {
                if (err)
                {
                    return res.status(500).json(
                        {
                            success: false,
                            message: err
                        }
                    );
                }
                next();
            });
        });
    });
}

var instructorAddStudent = function(req, res, next)
{
    console.log('courseController instructorAddStudent');

    var student_id = req.user.id.toString();

    Course.findById(req.params.COURSEID, function(err, course)
    {
        if (err || !course)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Course Not Found'
                }
            );
        }
        else
        {
            checkForStudent(req, res, course.sections.id(req.body.section_id), student_id, function(student)
            {
                if (student)
                {
                    return res.status(404).json(
                        {
                            success: false,
                            message: 'Student Already In Course'
                        }
                    );
                }
                else
                {
                    if (req.instructorRegisteredStudent)
                    {
                        console.log('instructorRegisteredStudent');

                        course.sections.id(req.body.section_id).students.push(
                            {
                                student_id: student_id,
                                username  : req.user.username,
                                firstname : req.user.firstname,
                                lastname  : req.user.lastname,
                                status    : 'pending'
                            }
                        );
                    }
                    else
                    {
                        console.log('NOT instructorRegisteredStudent');

                        course.sections.id(req.body.section_id).students.push(
                            {
                                student_id: student_id,
                                username  : req.user.username,
                                firstname : req.user.firstname,
                                lastname  : req.user.lastname,
                                status    : 'complete'
                            }
                        );
                    }
                    course.save(function(err, updated_course)
                    {
                        if (err)
                        {
                            return res.status(404).json(
                                {
                                    success   : false,
                                    message   : err
                                }
                            );
                        }
                        else
                        {
                            res.status(200).json(
                                {
                                    success   : true,
                                    jwt_token : req.token,
                                    message   : 'Student Added to Course',
                                    course    : course
                                }
                            );
                        }
                    });
                }
            });
        }
    });
}


var updateStudentStatus = function (req, res, next)
{
    console.log('userController updateStudentStatus');

    if (!req.course_info)
    {
        next();
    }
    else
    {
        Course.findById(req.course_info[0], function(err, course)
        {
            findStudentIndex(req, res, course.sections.id(req.course_info[1]), req.user_id, function(i)
            {
                var query_string = "sections.$.students."+i+".status";

                Course.update(
                {"_id" : req.course_info[0], "sections._id": req.course_info[1]},
                {$set: {[query_string]: "complete"}}, function(err, data)
                {
                    if (err || !data || data.nModified === 0)
                    {
                        return res.status(400).json(
                            {
                                success: false,
                                message: 'Interal Error: Could Not Delete User'
                            }
                        );
                    }
                    else
                    {
                        req.user.pre_register_key = undefined;
                        req.user.save(function(err, updated_user)
                        {
                            if (err)
                            {
                                return res.status(401).json(
                                    {
                                        success : false,
                                        message : 'Pre Registration Key Not Updated'
                                    }
                                );
                            }
                            else
                            {
                                req.user = updated_user;
                                next();
                            }
                        });
                    }
                });
            });
        });
    }
    /*
    Course.update( {'students.student_id': req.user.id.toString()}, {'$set': {'students.$.status': 'complete'}} , function(err, data){
      return res.status(200).json(
          {
              success   : true,
              message   : 'Registration Complete',
              user_id   : req.user._id.toString()
          }
      );
    });
    */
};

var joinCourse = function(req, res, next)
{
    console.log('courseController joinCourse');

    if (!req.body.section_key)
    {
        return res.status(400).json(
            {
                success: false,
                message: 'Please Enter Section Key'
            }
        );
    }

    Course.findOne({'sections.section_key': req.body.section_key}, function (err, course)
    {
        if (err || !course)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Invalid Course Key'
                }
            );
        }
        else
        {
            findSectionID(req, res, course.sections, req.body.section_key, function(id)
            {
                checkForStudent(req, res, course.sections.id(id), req.decodedToken.sub, function(student)
                {
                    if (student)
                    {
                        return res.status(404).json(
                            {
                                success: false,
                                message: 'Student Already In Course'
                            }
                        );
                    }
                    else
                    {
                        course.sections.id(id).students.push(
                            {
                                student_id: req.user.id.toString(),
                                username  : req.user.username,
                                firstname : req.user.firstname,
                                lastname  : req.user.lastname,
                                status    : 'complete'
                            }
                        );
                        course.save(function(err, updated_course)
                        {
                            if (err)
                            {
                                return res.status(500).json(
                                    {
                                        success   : false,
                                        message   : err
                                    }
                                );
                            }
                            else
                            {
                                next();
                            }
                        });
                    }
                });
            });
        }
    });
}

var deleteStudentFromCourse = function (req, res)
{
    console.log('userController deleteStudentFromCourse');

    Course.findById(req.params.COURSEID, function(err, course)
    {
        findSectionIndex(req, res, course.sections, req.body.section_name, function(i)
        {
            var query_string = "sections."+i+".students";

            Course.update(
            {"_id" : req.params.COURSEID, "sections.name" : req.body.section_name},
            {$pull: {[query_string]: {"student_id" : req.params.USERID}}}, function(err, data)
            {
                if (err || !data || data.nModified === 0)
                {
                    return res.status(400).json(
                        {
                            success: false,
                            message: 'Interal Error: Could Not Delete User'
                        }
                    );
                }
                else
                {
                    return res.status(200).json(
                        {
                            success : true,
                            jwt_token : req.token,
                            message: 'Student Deleted',
                            data  :   data
                        }
                    );
                }
            });
        });
    });
};

var getCourse = function (req, res)
{
    console.log('userController getUser');

    Course.findById(req.params.COURSEID, function(err, course)
    {
        if (err || !course)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Course Not Found'
                }
            );
        }
        else
        {
            course.__v = undefined;
            return res.status(200).json(
                {
                    success   : true,
                    jwt_token : req.token,
                    message   : 'Request Success',
                    course    : course
                }
            );
        }
    });
};

var getLectures = function (req, res)
{
    console.log('userController getUser');

    Course.findById(req.params.COURSEID, function(err, course)
    {
        if (err || !course)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Course Not Found'
                }
            );
        }
        else if (req.decodedToken.sub !== course.instructor.instructor_id)
        {
            return res.status(401).json(
                {
                    success: false,
                    message: 'User is not Course Instructor'
                }
            );
        }
        else
        {
            return res.status(200).json(
                {
                    success   : true,
                    jwt_token : req.token,
                    message   : 'Request Success',
                    lectures  : course.lectures
                }
            );
        }
    });
};

var getSectionNames = function (req, res)
{
    console.log('userController getSectionNames');

    Course.findById(req.params.COURSEID, {"sections._id": 0, "sections.students": 0}, function(err, course)
    {
        if (err || !course)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Course Not Found'
                }
            );
        }
        else
        {
            return res.status(200).json(
                {
                    success   : true,
                    jwt_token : req.token,
                    message   : 'Sections Retrieved Successful',
                    sections  : course.sections
                }
            );
        }
    });
};

var getStudents = function (req, res)
{
    console.log('userController getStudents');

    Course.findById(req.params.COURSEID, function(err, course)
    {
        if (err || !course)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Course Not Found'
                }
            );
        }
        else
        {
            return res.status(200).json(
                {
                    success   : true,
                    jwt_token : req.token,
                    message   : 'Request Success',
                    students  : course.students
                }
            );
        }
    });
};

var createLecture  = function (req, res)
{
    console.log('userController createLecture');

    Course.findById(req.params.COURSEID, function(err, course)
    {
        if (err || !course)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Course Not Found'
                }
            );
        }
        else
        {
            if (req.decodedToken.sub !== course.instructor.instructor_id)
            {
                return res.status(401).json(
                    {
                        success: false,
                        message: 'User not Authorized to create lecture'
                    }
                );
            }
            else
            {
                var question_array = [];
                var next_lecture_number = !course.lectures ? 1 : (course.lectures.length + 1);
                course.lectures.push(
                    {
                        lecture_num: next_lecture_number,
                        title: req.body.title,
                        day: req.body.day,
                        inSession: false,
                        questions: course.lectureOneQuestions(question_array)
                    }
                )
                course.save(function(err, updatedCourse) {
                    if (err || !updatedCourse)
                    {
                        return res.status(404).json(
                            {
                                success: false,
                                message: 'Lecture Not Created'
                            }
                        );
                    }
                    else
                    {
                        return res.status(201).json(
                            {
                                success : true,
                                jwt_token : req.token,
                                message : 'Lecture Creation Successsful',
                                lecture_id: updatedCourse.lectures[updatedCourse.lectures.length-1]._id
                            }
                        );
                    }
                });
            }
        }
    });
};

var deleteLecture  = function (req, res)
{
    console.log('userController createLecture');

    Course.findById(req.params.COURSEID, function(err, course)
    {
        if (err || !course)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Course Not Found'
                }
            );
        }
        else
        {
            if (req.decodedToken.sub !== course.instructor.instructor_id)
            {
                return res.status(401).json(
                    {
                        success: false,
                        message: 'User not Authorized to delete lecture'
                    }
                );
            }
            else
            {
                course.lectures.id(req.params.LECTUREID).remove();
                course.save(function (err)
                {
                    if (err)
                    {
                        return res.status(401).json(
                            {
                                success: false,
                                message: 'Unable To Delete Lecture'
                            }
                        );
                    }
                    else
                    {
                        return res.status(201).json(
                            {
                                success : true,
                                jwt_token : req.token,
                                message : 'Lecture Deletion Successsful'
                            }
                        );
                    }
                });
            }
        }
    });
};

var getUserCourses  = function (req, res)
{
    console.log('userController getUserCourses');

    if (req.decodedToken.role === roles.STUDENT)
    {
        Course.find({'sections.students.student_id' : req.decodedToken.sub}, function(err, courses)
        {
            if (err || !courses)
            {
                return res.status(404).json(
                    {
                        success: false,
                        message: 'No Coures Found'
                    }
                );
            }
            else
            {
                return res.status(201).json(
                    {
                        success   : true,
                        jwt_token : req.token,
                        message   : 'Request Success',
                        courses   : courses
                    }
                );
            }
        });
    }
    else
    {
        Course.find({'instructor.instructor_id' : req.decodedToken.sub}, function(err, courses)
        {
            if (err || !courses)
            {
                return res.status(404).json(
                    {
                        success: false,
                        message: 'No Coures Found'
                    }
                );
            }
            else
            {
                return res.status(201).json(
                    {
                        success : true,
                        jwt_token : req.token,
                        message   : 'Request Success',
                        courses : courses
                    }
                );
            }
        });
    }
};

module.exports =
{
    createCourse            :     createCourse,
    createLecture           :     createLecture,
    deleteLecture           :     deleteLecture,
    deleteStudentFromCourse :     deleteStudentFromCourse,
    getCourse               :     getCourse,
    getLectures             :     getLectures,
    getSectionNames             :     getSectionNames,
    getStudents             :     getStudents,
    getUserCourses          :     getUserCourses,
    instructorAddStudent    :     instructorAddStudent,
    joinCourse              :     joinCourse,
    updateStudentStatus     :     updateStudentStatus
};
