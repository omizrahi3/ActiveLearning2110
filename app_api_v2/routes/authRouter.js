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
var authRouter        = express.Router();

var authenticateController    = require('./../controllers/authenticateController');
var inputController    = require('./../controllers/inputController');
var courseController    = require('./../controllers/courseController');
var tokenController    = require('./../controllers/tokenController');

/**
AUTHENTICATE USER

POST	/api_v2/authenticate

Authentication:   none
Authorization:    none

Path Parameters:  none
Query String:     none
Request Body:     application/json     required
{
  "username": String Required
  "password": String Required
}
**/
authRouter.route('/')
    .post(inputController.requireUsername,
          inputController.requirePassword,
          authenticateController.authenticate,
          courseController.updateStudentStatus,
          tokenController.generateToken);

/**
LOG OUT USER

DELETE	/api_v2/authenticate

Authentication:  user token        required
Authorization:   none

Path Parameters: none
Query String:    none
Request Body:    none
**/
authRouter.route('/')
    .delete(tokenController.validateToken,
            tokenController.clearToken);

module.exports = authRouter;
