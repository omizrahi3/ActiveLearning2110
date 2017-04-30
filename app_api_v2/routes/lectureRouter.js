/* jshint node: true */
/* jshint esversion: 6 */

//************************************************************
//  lectureRouter.js                                        //
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

var express = require('express');
var lectureRouter = express.Router();

var lectureController = require('./../controllers/lectureController');
var tokenController = require('./../controllers/tokenController');

/**
Get Lecture Details

GET	/api_v2/lecture/{lecture_id}/

Authentication:   user token
Authorization:    instructor

Path Parameters:  lecture_id String	required
Query String:     none
Request Body: 	  none
**/
lectureRouter.route('/:LECTUREID')
    .get(tokenController.validateToken,
        tokenController.refreshToken,
        lectureController.getLecture);

/**
Add Question

IMPORTANT-Instructor ID's on both lecture and question must match. If you
are attempting to add a question created by another instructor you must
first call the copy question from existing API call and then add the
copy to the lecture.

POST	/api_v2/lecture/{lecture_id}/questions/{question_id}/

Authentication:   user token
Authorization:    instructor

Path Parameters:  lecture_id, question_id String	required
Query String:     none
Request Body: 	  none
**/
lectureRouter.route('/:LECTUREID/questions/:QUESTIONID')
    .post(tokenController.validateToken,
        tokenController.refreshToken,
        lectureController.addQuestionToLecture);

/**
Reorder Lecture Question

POST	/api_v2/lecture/{lecture_id}/questions{question_id}/reorder

Authentication:   user token
Authorization:    instructor

Path Parameters:  lecture_id String	required
Query String:     none
Request Body: application/json
{
	"index"				: Number Required This is the index where you want the question to go
}
**/
lectureRouter.route('/:LECTUREID/questions/:QUESTIONID/reorder')
    .post(tokenController.validateToken,
        tokenController.refreshToken,
        lectureController.reorderQuestion);


/**
Remove Question

DELETE	/api_v2/lecture/{lecture_id}/questions{question_id}/

Authentication:   user token
Authorization:    instructor

Path Parameters:  lecture_id, question_id String	required
Query String:     none
Request Body: 	  none
**/
lectureRouter.route('/:LECTUREID/questions/:QUESTIONID')
    .delete(tokenController.validateToken,
          tokenController.refreshToken,
          lectureController.removeQuestion);

/**
Save Question Set

POST	/api_v2/lecture/{lecture_id}/questionset

Authentication:   user token
Authorization:    instructor

Path Parameters:  lecture_id String	required
Query String:     none
Request Body: application/json
{
	"title"				: String Required
}
**/
lectureRouter.route('/:LECTUREID/questionset')
    .post(tokenController.validateToken,
        tokenController.refreshToken,
        lectureController.saveQuestionSet);

/**
Add Question Set to Lecture

POST	/api_v2/lecture/{lecture_id}/questionset/{questionSet_id}/

Authentication:   user token
Authorization:    instructor

Path Parameters:  lecture_id, questionSet_id String	required
Query String:     none
Request Body: 	  none
**/
lectureRouter.route('/:LECTUREID/questionset/:QUESTIONSETID')
    .post(tokenController.validateToken,
        tokenController.refreshToken,
        lectureController.addQuestionSet);

module.exports = lectureRouter;
