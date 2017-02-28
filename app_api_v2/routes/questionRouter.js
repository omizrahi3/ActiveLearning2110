/* jshint node: true */

//************************************************************
//  questionRouter.js                                       //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Amy Zhuang on 2/5/17.	                    //
//  Copyright © 2017 Amy Zhuang. All rights reserved.	    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  05Feb17     A. Zhuang   Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var express           = require('express');
var questionRouter        = express.Router();

var questionController    = require('./../controllers/questionController');
var authorizeController  = require('./../controllers/authorizeController');
var inputController    = require('./../controllers/inputController');
var tokenController    = require('./../controllers/tokenController');
var userController       = require('./../controllers/userController');
var courseController     = require('./../controllers/courseController');
var signupController     = require('./../controllers/signupController');

/**
GET ALL QUESTIONS

GET	/api_v2/questions

Authentication:   user token
Authorization:    none

Path Parameters:  none
Query String:     none
Request Body:     none
**/
questionRouter.route('/')
    .get(tokenController.validateToken,
    	  tokenController.refreshToken,
    	  authorizeController.adminOrInstructorOrSelf,
    	  questionController.getAll);

/**
Add QUESTION

POST	/api_v2/questions

Authentication:   user token
Authorization:    admin, instructor

Path Parameters:  question_id String	required
Query String:     none
Request Body: application/json
{
	"tags"				: [String] Required
	"problem_statement"	: String Required 
	"answer_choices"	: [String] Required
	"answer"			: Number
}
**/
questionRouter.route('/')
	.post(tokenController.validateToken,
		  tokenController.refreshToken,
		  authorizeController.adminOrInstructorOrSelf,
		  inputController.requireTags,
		  inputController.requireProblemStatement,
		  inputController.requireAnswerChoices,
		  inputController.requireAnswer,
		  questionController.savedQuestionToDB);

/**
DELETE QUESTION

DELETE	/api_v2/questions/{question_id}/

Authentication:   user token
Authorization:    admin, instructor

Path Parameters:  question_id String	required
Query String:     none
Request Body: 	  none
**/
questionRouter.route('/:QUESTIONID')
	.delete(tokenController.validateToken,
		    tokenController.refreshToken,
		    authorizeController.adminOrInstructorOrSelf,
		    questionController.deleteQuestion);

/**
ADD TAG

PUT	/api_v2/questions/{question_id}/tag

Authentication:   user token
Authorization:    admin, instructor

Path Parameters:  none
Query String:     none
Request Body: 	  application/json	required
{
	"new_tag": 	String	required
}
**/
questionRouter.route('/:QUESTIONID/tag')
	.put(tokenController.validateToken,
		 tokenController.refreshToken,
		 authorizeController.adminOrInstructorOrSelf,
		 questionController.addTag);


/**
DELETE TAG

DELETE	/api_v2/questions/{question_id}/tag

Authentication:   user token
Authorization:    admin, instructor

Path Parameters:  question_id String	required
Query String:     none
Request Body: 	  application/json 		required
{
	"delete_tag": 	String required
}
**/
questionRouter.route('/:QUESTIONID/tag')
	.delete(tokenController.validateToken,
		    tokenController.refreshToken,
		    authorizeController.adminOrInstructorOrSelf,
		    questionController.deleteTag);

/**
EDIT PROBLEM STATEMENT QUESTION

POST	/api_v2/questions/{question_id}/problem_statement

Authentication:   user token
Authorization:    admin, instructor

Path Parameters:  question_id String	required
Query String:     none
Request Body: 	  application/json 		required
{
	"new_problem_statement": 	String 	required
}
**/
questionRouter.route('/:QUESTIONID/problem_statement')
	.post(tokenController.validateToken,
		  tokenController.refreshToken,
		  authorizeController.adminOrInstructorOrSelf,
		  questionController.editProblemStatement);


/**
ADD ANSWER CHOICE

PUT	/api_v2/questions/{question_id}/answer_choice

Authentication:   user token
Authorization:    admin, instructor

Path Parameters:  question_id String	required
Query String:     none
Request Body: 	  appication/json 		required
{
	"new_answer_choice": 	String		required
}
**/
questionRouter.route('/:QUESTIONID/answer_choice')
	.put(tokenController.validateToken,
		  tokenController.refreshToken,
		  authorizeController.adminOrInstructorOrSelf,
		  questionController.addAnswerChoice);

/**
DELETE ANSWER CHOICE

DELETE	/api_v2/questions/{question_id}/answer_choice

Authentication:   user token
Authorization:    admin, instructor

Path Parameters:  question_id String	required
Query String:     none
Request Body: 	  application/json 		required
{
	"delete_answer_choice": 	String	required
}
**/
questionRouter.route('/:QUESTIONID/answer_choice')
	.delete(tokenController.validateToken,
			tokenController.refreshToken,
			authorizeController.adminOrInstructorOrSelf,
			questionController.deleteAnswerChoice);

/**
EDIT ANSWER CHOICE

POST	/api_v2/questions/{question_id}/answer_choice

Authentication:   user token
Authorization:    admin, instructor

Path Parameters:  question_id String	required
Query String:     none
Request Body: 	  application/json 		required
{
	"edit_answer_choice": 	String		required
	"new_answer_choice": 	String		required
}
**/
questionRouter.route('/:QUESTIONID/answer_choice')
	.post(tokenController.validateToken,
		  tokenController.refreshToken,
		  authorizeController.adminOrInstructorOrSelf,
		  questionController.editAnswerChoice);

/**
EDIT ANSWER

POST	/api_v2/questions/{question_id}/answer

Authentication:   user token
Authorization:    admin, instructor

Path Parameters:  question_id String	required
Query String:     none
Request Body: 	  application/json		required
{
	"new_answer": 	Number				required
}
**/
questionRouter.route('/:QUESTIONID/answer')
	.post(tokenController.validateToken,
		  tokenController.refreshToken,
		  authorizeController.adminOrInstructorOrSelf,
		  questionController.editAnswer);



module.exports = questionRouter;
