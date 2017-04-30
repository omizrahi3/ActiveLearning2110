/* jshint node: true */
/* jshint esversion: 6 */

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

var User = require('./../models/userModel'),
    winston = require('winston'),
    bcrypt = require('bcryptjs');

var roles = {
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor',
    STUDENT: 'student',
};

var authenticate = function(req, res, next) {
    winston.info('authenticateController: Authenticate user: %s', req.body.username);

    User.findOne({
            username: req.body.username
        })
        .exec()
        .then(function(user) {
            return new Promise((resolve, reject) => {
                var error_message;
                if (!user) {
                    error_message = new Error('User Does Not Exist');
                    reject(error_message);
                } else if (!bcrypt.compareSync(req.body.password, user.password)) {
                    error_message = new Error('Incorrect Password');
                    reject(error_message);
                } else if (user.deactivated) {
                    error_message = new Error('Account Deactivated');
                    reject(error_message);
                } else resolve(user);
            });
        })
        .then(function(user) {
            req.user = user;
            req.user_id = user._id.toString();
            req.user_role = user.role;
            next();
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        });
};

module.exports = {
    authenticate: authenticate
};
