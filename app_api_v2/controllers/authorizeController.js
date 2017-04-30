/* jshint node: true */
/* jshint esversion: 6 */

//************************************************************
//  authorizeController.js                                  //
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
    winston = require('winston');

var roles = {
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor',
    STUDENT: 'student',
};

var admin = function(req, res, next) {
    winston.info('authorizeController: admin authorization check');

    if (req.decodedToken.role !== roles.ADMIN) {
        return res.status(401).json({
            success: false,
            message: 'Admin Authorization Required'
        });
    } else {
        next();
    }
};

var adminOrInstructorOrSelf = function(req, res, next) {
    winston.info('authorizeController: admin/instructor/self check');

    if (req.decodedToken.sub !== req.query.id && req.decodedToken.role !== roles.ADMIN && req.decodedToken.role !== roles.INSTRUCTOR) {
        return res.status(401).json({
            success: false,
            message: 'Not Authorized: Admin or Instructor or Self Only'
        });
    } else {
        next();
    }
};

var adminOrSelf = function(req, res, next) {
    winston.info('authorizeController: admin/self check');

    if (req.decodedToken.sub !== req.params.USERID && req.decodedToken.role !== roles.ADMIN) {
        return res.status(401).json({
            success: false,
            message: 'Not Authorized: Admin or Self Only'
        });
    } else {
        next();
    }
};

var instructor = function(req, res, next) {
    winston.info('authorizeController: instructor check');

    if (req.decodedToken.role !== roles.INSTRUCTOR) {
        return res.status(401).json({
            success: false,
            message: 'Instructor Authorization Required'
        });
    } else {
        next();
    }
};

var roleUpdate = function(req, res, next) {
    winston.info('authorizeController: update role');

    if (!req.body.new_role) {
        next();
    } else {
        if (req.decodedToken.role !== roles.ADMIN) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized: Role Update Admin Only'
            });
        } else {
            next();
        }
    }
};

var self = function(req, res, next) {
    winston.info('authorizeController: self authorize');

    if (req.decodedToken.sub !== req.params.USERID) {
        return res.status(401).json({
            success: false,
            message: 'Not Authorized'
        });
    } else {
        next();
    }
};

var student = function(req, res, next) {
    winston.info('authorizeController: student authroize');

    if (req.decodedToken.role !== roles.STUDENT) {
        return res.status(401).json({
            success: false,
            message: 'Student Authorization Required'
        });
    } else {
        next();
    }
};

var studentOrInstructor = function(req, res, next) {
    winston.info('authorizeController: student/instructor authorize');

    if (req.decodedToken.role !== roles.STUDENT && req.decodedToken.role !== roles.INSTRUCTOR) {
        return res.status(401).json({
            success: false,
            message: 'Student or Instructor Authorization Required'
        });
    } else {
        next();
    }
};

module.exports = {
    admin: admin,
    adminOrInstructorOrSelf: adminOrInstructorOrSelf,
    adminOrSelf: adminOrSelf,
    instructor: instructor,
    roleUpdate: roleUpdate,
    self: self,
    student: student,
    studentOrInstructor: studentOrInstructor
};
