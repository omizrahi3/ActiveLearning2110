/* jshint node: true */

//************************************************************
//  authenticateController.js                               //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 01/01/17.                   //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  01Jan17     O. Mizrahi  Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var User       = require('./../models/userModel');
var bcrypt     = require('bcryptjs');

var roles =   {
                  ADMIN       : 'admin',
                  INSTRUCTOR  : 'instructor',
                  STUDENT     : 'student',
              };


var authenticate = function (req, res, next)
{
    console.log('authenticateController authenticate');

    User.findOne({username: req.body.username}, function(err, user)
    {
        if (err)
        {
            return res.status(500).json(
                {
                    success: false,
                    message: 'Internal Error'
                }
            );
        }
        else if (!user)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'User Does Not Exist'
                }
            );
        }
        else if (!bcrypt.compareSync(req.body.password, user.password))
        {
            return res.status(401).json(
                {
                    success: false,
                    message: 'Invalid Password'
                }
            );
        }
        else if (user.deactivated)
        {
            return res.status(401).json(
                {
                    success: false,
                    message: 'Account Has Been Locked. Please Contact Admin'
                }
            );
        }
        else if (user.pre_register_key)
        {
            return res.status(401).json(
                {
                    success: false,
                    message: 'Complete Pre Registration'
                }
            );
        }
        else
        {
            req.user_id    = user._id.toString();
            req.user_role  = user.role;
            next();
        }
    });
};

module.exports =
{
    authenticate        :   authenticate
};
