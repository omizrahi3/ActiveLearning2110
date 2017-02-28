/* jshint node: true */

//************************************************************
//  index.js                                                //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 9/18/16.                    //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  27Dec16     O. Mizrahi  Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var authRouter    = require('./authRouter');
var signupRouter  = require('./signupRouter');
var userRouter    = require('./userRouter');
var courseRouter  = require('./courseRouter');
var questionRouter = require('./questionRouter');

module.exports  = function(api_v2_router)
{
    api_v2_router.use('/authenticate', authRouter);
    api_v2_router.use('/user', userRouter);
    api_v2_router.use('/signup', signupRouter);
    api_v2_router.use('/course', courseRouter);
    api_v2_router.use('/questions', questionRouter);
};
