/* jshint node: true */

//************************************************************
//  signupRouter.js                                         //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 12/22/16                    //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  22Dec16     O. Mizrahi  Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var express           = require('express');
var signupRouter      = express.Router();

var signupController    = require('./../controllers/signupController');
var inputController     = require('./../controllers/inputController');
var tokenController     = require('./../controllers/tokenController');
var userController     = require('./../controllers/userController');
var courseController     = require('./../controllers/courseController');
var authorizeController = require('./../controllers/authorizeController');

/**
REGISTER USER

POST	/api_v2/signup?role={user_role}/

Authentication: none
Authorization:  none

Path Parameters: none
Query String:    none
Query String:    role  Pass either 'admin' or 'instructor' required for admin or instructor registration

Request Body application/json
{
  "username"  : String Required
  "password"  : String Required
  "firstname" : String Required
  "lastname"  : String Required
  "key"       : String Required for admin or instructor registration
}
**/
signupRouter.route('/')
    .post(inputController.requireFirstname,
          inputController.requireLastname,
          inputController.requireUsername,
          inputController.requirePassword,
          signupController.registerAdmin,
          signupController.registerInstructor,
          signupController.registerStudent,
          signupController.savedUserToDB);

/**
CREATE ADMIN REGISTRATION KEY

POST	/api_v2/signup/admin_key

Authentication:   user token        required
Authorization:    admin             required

Path Parameters:  none
Query String:     none
Request Body:     none
**/
signupRouter.route('/admin_key')
    .post(tokenController.validateToken,
          tokenController.refreshToken,
          authorizeController.admin,
          signupController.createAdminKey,
          signupController.getRegistrationKeys);

/**
CREATE INSTRUCTOR REGISTRATION KEY

POST	/api_v2/signup/instructor_key

Authentication:   user token        required
Authorization:    admin             required

Path Parameters:  none
Query String:     none
Request Body:     none
**/
signupRouter.route('/instructor_key')
    .post(tokenController.validateToken,
          tokenController.refreshToken,
          authorizeController.admin,
          signupController.createInstructorKey);

/**
GET REGISTRATION KEYS

GET	/api_v2/signup/registration_key

Authentication:   user token        required
Authorization:    admin             required

Path Parameters:  none
Query String:     none
Request Body:     none
**/
signupRouter.route('/registration_key')
   .get(tokenController.validateToken,
        tokenController.refreshToken,
        authorizeController.admin,
        signupController.getRegistrationKeys);

module.exports = signupRouter;
