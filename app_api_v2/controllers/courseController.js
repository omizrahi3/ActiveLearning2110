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

function findStudentIndex(req, res, section, student_id, callback)
{
    console.log('courseController findStudentIndex');

    console.log(section);

    for (var i = 0; i < section.students.length; i++)
    {
        console.log(section.students[i].student_id+"     "+student_id);
        if (section.students[i].student_id === student_id)
        {
            callback(i);
        }
    }
}

function removeCourseData(courses, callback)
{
    console.log('courseController removeCourseData');

    for (var i = 0; i < courses.length; i++)
    {
        courses[i].average = 999;
        courses[i].numOfStudents = courses[i].students.length;
        courses[i].__v = undefined;
        courses[i].course_key = undefined;
        courses[i].createdAt = undefined;
        courses[i].students = undefined;
    }

    callback(courses);
}

function findStudentAverage(courses, student_id, callback)
{
    console.log('courseController findStudentAverage');

    for (var i = 0; i < courses.length; i++)
    {
        courses[i].average = averageHelper(courses[i], student_id);
        courses[i].sections = undefined;
    }
    callback(courses)
}

function averageHelper(course, student_id, callback)
{
    console.log('courseController averageHelper');

    for (var j = 0; j < course.sections.length; j++)
    {
        for (var k = 0; k < course.sections[j].students.length; k++)
        {
            if (course.sections[j].students[k].student_id === student_id)
            {
                course.section = course.sections[j].name;
                return course.sections[j].students[k].average;
            }
        }
    }
}

var createCourse = function(req, res, next)
{
    console.log('courseController createCourse');

    User.findById(req.decodedToken.sub)
    .exec()
    .then(function(user){
        var newCourse = null;

        var course_instructor =
        {
            instructor_id   : user._id.toString(),
            username        : user.username,
            firstname       : user.firstname,
            lastname        : user.lastname,
            photo           : user.photo
        };

        for (var i = 0; i < req.body.sections.length; i++)
        {
            req.body.sections[i].section_key = rand.generate();
        }

        newCourse = new Course(
        {
            title       : req.body.title,
            instructor  : course_instructor,
            schedule    : req.body.course_schedule,
            sections    : req.body.sections,
            course_key  : rand.generate()
        });

        return newCourse.save();
    })
    .then(function(course){
        return next();
    })
    .catch(function(err){
        return res.status(500).json(
            {
                success: false,
                message: 'Unsable to Create Course'
            }
        );
    });
}

var instructorAddStudent = function(req, res, next)
{
    console.log('courseController instructorAddStudent');

    var student_id = req.student.id.toString();


    Course.findById(req.params.COURSEID)
    .exec()
    .then(function(course){
      return new Promise((resolve, reject)=>{
        for (var i = 0; i < course.students.length; i++)
        {
            if (course.students[i] === req.student.username)
            {
                var error_message = new Error('Student Already In Course');
                reject(error_message);
            }
        }
        resolve(course);
      });
    })
    .then(function(course){
        if (req.instructorRegisteredStudent || req.student.pre_register_key)
        {
            console.log('instructorRegisteredStudent');

            course.sections.id(req.params.SECTIONID).students.push(
                {
                    student_id: student_id,
                    username  : req.student.username,
                    firstname : req.student.firstname,
                    lastname  : req.student.lastname,
                    status    : 'pending'
                }
            );
        }
        else
        {
            console.log('NOT instructorRegisteredStudent');

            course.sections.id(req.params.SECTIONID).students.push(
                {
                    student_id: student_id,
                    username  : req.student.username,
                    firstname : req.student.firstname,
                    lastname  : req.student.lastname,
                    status    : 'complete'
                }
            );
        }
        course.students.push(req.student.username);
        course.save();
    })
    .then(function(course){
        return res.status(200).json(
            {
                success   : true,
                jwt_token : req.token,
                message   : 'Student Added to Course',
                student_username    : req.student.username
            }
        );
    })
    .catch(function(err){
        return res.status(404).json(
            {
                success: false,
                message: 'Student Already In Course',
                student_username    : req.student.username
            }
        );
    });


    /*
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
            checkForStudent(req, res, course.sections.id(req.params.SECTIONID), student_id, function(student)
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
                    if (req.instructorRegisteredStudent || req.student.pre_register_key)
                    {
                        console.log('instructorRegisteredStudent');

                        course.sections.id(req.params.SECTIONID).students.push(
                            {
                                student_id: student_id,
                                username  : req.student.username,
                                firstname : req.student.firstname,
                                lastname  : req.student.lastname,
                                status    : 'pending'
                            }
                        );
                    }
                    else
                    {
                        console.log('NOT instructorRegisteredStudent');

                        course.sections.id(req.params.SECTIONID).students.push(
                            {
                                student_id: student_id,
                                username  : req.student.username,
                                firstname : req.student.firstname,
                                lastname  : req.student.lastname,
                                status    : 'complete'
                            }
                        );
                    }
                    course.students.push(req.student.username);
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
                                    student_username    : req.student.username
                                }
                            );
                        }
                    });
                }
            });
        }
    });
    */
}

var updateStudentStatus = function (req, res, next)
{
    console.log('courseController updateStudentStatus');

    if (req.user.pre_register_key === undefined)
    {
        next();
    }
    else
    {
        Course.findById(req.user.pre_registered.course_id)
        .exec()
        .then(function(course){
            var section = course.sections.id(req.user.pre_registered.section_id);
            console.log(section.students);
            for (var i = 0; i < section.students.length; i++)
            {
                if (section.students[i].student_id === req.user_id)
                {
                    req.student_index = i;
                    return course;
                }
            }
        })
        .then(function(user){
            var query_string = "sections.$.students."+req.student_index+".status";
            return Course.update({"_id" : req.user.pre_registered.course_id, "sections._id": req.user.pre_registered.section_id},{$set: {[query_string]: "complete"}});
        })
        .then(function(data){
            req.user.pre_register_key = undefined;
            req.user.pre_registered = undefined;
            req.user.save();
        })
        .then(function(user){
            req.user = user;
            next();
        })
        .catch(function(err){
            return res.status(401).json(
                {
                    success : false,
                    message : 'Pre Registration Not Complete'
                }
            );
        });
        /*
        Course.findById(req.user.pre_registered.course_id, function(err, course)
        {
            console.log(course);
            findStudentIndex(req, res, course.sections.id(req.user.pre_registered.section_id), req.user_id, function(i)
            {
                var query_string = "sections.$.students."+i+".status";

                Course.update(
                {"_id" : req.user.pre_registered.course_id, "sections._id": req.user.pre_registered.section_id},
                {$set: {[query_string]: "complete"}}, function(err, data)
                {
                    if (err || !data || data.nModified === 0)
                    {
                        return res.status(400).json(
                            {
                                success: false,
                                message: 'Interal Error: Could Not Update User'
                            }
                        );
                    }
                    else
                    {
                        req.user.pre_register_key = undefined;
                        req.user.pre_registered = undefined;
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
        */
    }
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
                        course.students.push(req.user.username);
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

    User.findById(req.params.USERID, function(err, user)
    {
        Course.findOneAndUpdate(
        {"_id" : req.params.COURSEID, "sections._id": req.params.SECTIONID},
        {$pull: {"sections.$.students": {"student_id" : req.params.USERID}, "students": user.username}},
        {new: true}, function(err, updated_course)
        {
            if(err)
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
                        success   : true,
                        jwt_token : req.token,
                        message   : 'Student Deleted',
                        course    : updated_course
                    }
                );
            }
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
                var next_lecture_number = !course.lectures ? 1 : (course.lectures.length + 1);

                //var iso_date = new Date(req.body.lecture_schedule.date+" "+req.body.lecture_schedule.time);
                //req.body.lecture_schedule.iso = iso_date;

                req.body.lecture_schedule.time = course.schedule.time;

                var new_lecture =
                {
                    title:  req.body.lecture_title,
                    number: next_lecture_number,
                    schedule: req.body.lecture_schedule
                }

                course.lectures.push(new_lecture);

                course.save(function(err, updatedCourse) {
                    if (err || !updatedCourse)
                    {
                        return res.status(404).json(
                            {
                                success: false,
                                message: err
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
                                course_id: updatedCourse._id.toString(),
                                lectures: updatedCourse.lectures
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
                var return_courses = [];
                for (var i = 0; i < courses.length; i++)
                {
                    return_courses.push(courses[i].toObject());
                }
                removeCourseData(return_courses, function(updated_courses1)
                {
                    findStudentAverage(updated_courses1, req.decodedToken.sub, function(updated_courses2)
                    {
                      return res.status(201).json(
                          {
                              success   : true,
                              jwt_token : req.token,
                              message   : 'Request Success',
                              courses   : updated_courses2
                          }
                      );
                    });
                });
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

/*
var getUserCourses2  = function (req, res)
{
    console.log('userController getUserCourses2');


    Course.find({'sections.students.student_id' : req.decodedToken.sub})
        .exec()
        .then(function(courses){


        })
        .catch(function(err){
            return res.status(500).json(
                {
                    success: false,
                    message: 'Internal Error'
                }
            );
        });


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
                var return_courses = [];
                for (var i = 0; i < courses.length; i++)
                {
                    return_courses.push(courses[i].toObject());
                }
                removeCourseData(return_courses, function(updated_courses1)
                {
                    findStudentAverage(updated_courses1, req.decodedToken.sub, function(updated_courses2)
                    {
                      return res.status(201).json(
                          {
                              success   : true,
                              jwt_token : req.token,
                              message   : 'Request Success',
                              courses   : updated_courses2
                          }
                      );
                    });
                });
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
*/

module.exports =
{
    createCourse            :     createCourse,
    createLecture           :     createLecture,
    deleteLecture           :     deleteLecture,
    deleteStudentFromCourse :     deleteStudentFromCourse,
    getCourse               :     getCourse,
    getLectures             :     getLectures,
    getSectionNames         :     getSectionNames,
    getStudents             :     getStudents,
    getUserCourses          :     getUserCourses,
    instructorAddStudent    :     instructorAddStudent,
    joinCourse              :     joinCourse,
    updateStudentStatus     :     updateStudentStatus
};
