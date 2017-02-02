/* jshint node: true */

//************************************************************
//  authRouter.js                                           //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 12/22/16.                   //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  22Dec16     O. Mizrahi  Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var express           = require('express');
var userRouter        = express.Router();

var userController        = require('./../controllers/userController');
var courseController      = require('./../controllers/courseController');
var tokenController       = require('./../controllers/tokenController');
var authorizeController   = require('./../controllers/authorizeController');
var inputController       = require('./../controllers/inputController');

/**
GET ALL USERS

GET	/api_v2/user

Authentication:   user token        required
Authorization:    admin             required

Path Parameters:  none
Query String:     none
Request Body:     none
**/
userRouter.route('/')
    .get(tokenController.validateToken,
         tokenController.refreshToken,
         authorizeController.admin,
         userController.getAll);

/**
GET USER

GET	/api_v2/user/{user_id}/

Authentication:   user token        required
Authorization:    admin or self     required

Path Parameters:  user_id String    required
Query String:     none
Request Body:     none
**/
userRouter.route('/:USERID')
    .get(tokenController.validateToken,
         tokenController.refreshToken,
         authorizeController.adminOrSelf,
         userController.getUser);

/**
GET USER COURSES

GET	/api_v2/user/{user_id}/courses

Authentication:   user token                required
Authorization:    student or instructor     required

Path Parameters:  user_id String    required
Query String:     none
Request Body:     none
**/
userRouter.route('/:USERID/courses')
    .get(tokenController.validateToken,
         tokenController.refreshToken,
         authorizeController.studentOrInstructor,
         courseController.getUserCourses);

/**
UPDATE USER

POST	/api_v2/user/{user_id}/

Authentication:   user token        required
Authorization:    admin or self     required

Path Parameters:  user_id String    required
Query String:     none
Request Body:     application/json  required
{
  "new_photo"   : String            Optional
  "new_firstname":String
  "new_lastname": String
  "new_role"    : String            Optional (admin only)
}
**/
userRouter.route('/:USERID')
    .post(tokenController.validateToken,
          tokenController.refreshToken,
          authorizeController.adminOrSelf,
          authorizeController.roleUpdate,
          userController.updateUser);

/**
UPDATE USER PASSWORD

POST	/api_v2/user/{user_id}/password

Authentication:   user token        required
Authorization:    self              required

Path Parameters:  user_id String    required
Query String:     none
Request Body:     application/json  required
{
  "cur_password": String            required
  "new_password": String            required
}
**/
userRouter.route('/:USERID/password')
    .post(tokenController.validateToken,
          tokenController.refreshToken,
          authorizeController.self,
          inputController.requireCurrentPassword,
          inputController.requireNewPassword,
          userController.updatePassword);

/**
DELETE USER

DELETE	/api_v2/user/{user_id}/

Authentication:   user token        required
Authorization:    admin or self     required

Path Parameters:  user_id String   required
Query String:     none
Request Body:     none
**/
userRouter.route('/:USERID')
    .delete(tokenController.validateToken,
            tokenController.refreshToken,
            authorizeController.adminOrSelf,
            userController.deleteUser,
            tokenController.clearToken);


module.exports = userRouter;
