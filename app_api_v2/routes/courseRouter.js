/* jshint node: true */

//************************************************************
//  authRouter.js                                           //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 9/18/16.                    //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  22Dec16     O. Mizrahi  Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var express           = require('express');
var courseRouter      = express.Router();

var authorizeController  = require('./../controllers/authorizeController');
var inputController      = require('./../controllers/inputController');
var tokenController      = require('./../controllers/tokenController');
var userController       = require('./../controllers/userController');
var courseController     = require('./../controllers/courseController');
var signupController     = require('./../controllers/signupController');

/**
INSTRUCTOR CREATE COURSE

POST	/api_v2/course

Authentication:   user token
Authorization:    instructor

Path Parameters:  none
Query String:     none
Request Body:     application/json     required
{
    "title":      String               required
    "sections":   [String]             required
    "course_schedule":
    {
        "semester": String             required
        "days":     [String]           required     enum ["mon", "tue", "wed", "thu", "fri"] required
    }
}
**/
courseRouter.route('/')
    .post(tokenController.validateToken,
          tokenController.refreshToken,
          authorizeController.instructor,
          inputController.requireCourseTitle,
          inputController.requireCourseSchedule,
          inputController.requireSections,
          courseController.createCourse,
          courseController.getUserCourses);


/*
courseRouter.route('/')
    .post(tokenController.validateToken,
          tokenController.refreshToken,
          authorizeController.instructor,
          inputController.requireCourseTitle,
          courseController2.createCourse);
*/

/**
STUDENT JOIN COURSE

POST	/api_v2/course/students

Authentication:   user token
Authorization:    student

Path Parameters:  none
Query String:     none
Request Body:     application/json    required
{
  "course_key":   String              required
  "section":      String              required
}
**/
courseRouter.route('/students')
    .post(tokenController.validateToken,
          tokenController.refreshToken,
          authorizeController.student,
          inputController.requireCourseKey,
          userController.setUserName,
          courseController.joinCourse,
          courseController.getUserCourses);

/**
INSTRUCTOR ADD STUDENT

PUT  /api_v2/course/{course_id}/student

Authentication:   user token
Authorization:    instructor

Path Parameters:  none
Query String:     none
Request Body:     application/json    required
{
  "username":     String              required
  "firstname":    String              required
  "lastname":     String              required
  "section":      String              required
}
**/
courseRouter.route('/:COURSEID/student')
    .put(tokenController.validateToken,
         tokenController.refreshToken,
         authorizeController.instructor,
         inputController.requireFirstname,
         inputController.requireLastname,
         inputController.requireUsername,
         userController.isValidStudent,
         signupController.preRegisterStudent,
         courseController.instructorAddStudent);

/**
GET STUDENTS IN COURSE

GET	/api_v2/course/{course_id}/students

Authentication:   user token
Authorization:    instructor

Path Parameters:  course_id String    required
Query String:     none
Request Body:     application/json    required
{
  "course_key":   String              required
}
**/
courseRouter.route('/:COURSEID/students')
    .get(tokenController.validateToken,
         tokenController.refreshToken,
         courseController.getStudents);

/**
DELETE STUDENT FROM COURSE

DELETE	/api_v2/course/{course_id}/students?id={student_id}/

Authentication:   user token
Authorization:    admin, instructor or self student

Path Parameters:  course_id String    required
Query String:     id        String    Pass the 'student_id' of the student to remove from course
Request Body:     none
**/
courseRouter.route('/:COURSEID/students')
    .delete(tokenController.validateToken,
            tokenController.refreshToken,
            authorizeController.adminOrInstructorOrSelf,
            courseController.deleteStudentFromCourse);

/**
GET COURSE INFO

GET	/api_v2/course/{course_id}/

Authentication:   user token
Authorization:    instructor

Path Parameters:  course_id String    required
Query String:     none
Request Body:     none
**/
courseRouter.route('/:COURSEID')
    .get(tokenController.validateToken,
         tokenController.refreshToken,
         courseController.getCourse);

/**
CREATE COURSE LECTURE

POST	/api_v2/course/{course_id}/lectures

Authentication:   user token
Authorization:    instructor

Path Parameters:  course_id String    required
Query String:     none
Request Body:     application/json    required
{
  "title":        String              required
  "day":          String              required
}
**/
courseRouter.route('/:COURSEID/lectures')
   .post(tokenController.validateToken,
         tokenController.refreshToken,
         authorizeController.instructor,
         courseController.createLecture);

/**
DELETE COURSE LECTURE

DELETE	/api_v2/course/{course_id}/lectures/{lecture_id}/

Authentication:   user token
Authorization:    instructor

Path Parameters:  course_id String, lecture_id String     required
Query String:     none
Request Body:     none
**/
courseRouter.route('/:COURSEID/lectures/:LECTUREID')
  .delete(tokenController.validateToken,
          tokenController.refreshToken,
          authorizeController.instructor,
          courseController.deleteLecture);

/**
GET COURSE LECTURES

GET	/api_v2/course/{course_id}/lectures

Authentication:   user token
Authorization:    instructor

Path Parameters:  course_id String     required
Query String:     none
Request Body:     none
**/
courseRouter.route('/:COURSEID/lectures')
  .get(tokenController.validateToken,
       tokenController.refreshToken,
       authorizeController.instructor,
       courseController.getLectures);

module.exports = courseRouter;
