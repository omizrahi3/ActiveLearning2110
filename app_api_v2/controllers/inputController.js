/* jshint node: true */
/* jshint esversion: 6 */

//************************************************************
//  signupController.js                                     //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 01/07/17.                   //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  07Jan17     O. Mizrahi  Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var winston = require('winston');

var roles = {
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor',
    STUDENT: 'student',
};

var requirePreRegisterKey = function(req, res, next) {
    winston.info('inputController: require pre register key');

    if (!req.body.pre_register_key) {
        return res.status(400).json({
            success: false,
            message: 'Please Enter Pre Register Key'
        });
    } else {
        next();
    }
};

var requireCourseTitle = function(req, res, next) {
    winston.info('inputController: require course title');

    if (!req.body.title) {
        return res.status(400).json({
            success: false,
            message: 'Please Enter Course Title'
        });
    } else {
        next();
    }
};

var requireSections = function(req, res, next) {
    winston.info('inputController: require sections');

    if (!req.body.sections) {
        return res.status(400).json({
            success: false,
            message: 'Please Enter Course Sections'
        });
    } else {
        next();
    }
};

var requireCourseSchedule = function(req, res, next) {
    winston.info('inputController: require course schedule');

    if (!req.body.course_schedule) {
        return res.status(400).json({
            success: false,
            message: 'Please Enter Course Schedule'
        });
    } else {
        next();
    }
};

var requireCourseKey = function(req, res, next) {
    winston.info('inputController: require course key');

    if (!req.body.course_key) {
        return res.status(400).json({
            success: false,
            message: 'Please Enter Course Key'
        });
    } else {
        next();
    }
};

var requireCurrentPassword = function(req, res, next) {
    winston.info('inputController: require current password');

    if (!req.body.cur_password) {
        return res.status(400).json({
            success: false,
            message: 'Please Enter Current Password'
        });
    } else {
        next();
    }
};

var requireNewPassword = function(req, res, next) {
    winston.info('inputController: require new password');

    if (!req.body.new_password) {
        return res.status(400).json({
            success: false,
            message: 'Please Enter New Password'
        });
    } else {
        next();
    }
};

var requireUsername = function(req, res, next) {
    winston.info('inputController: require username');

    if (!req.body.username) {
        return res.status(400).json({
            success: false,
            message: 'Please Enter Username'
        });
    } else {
        next();
    }
};

var requireFirstname = function(req, res, next) {
    winston.info('inputController: require first name');

    if (!req.body.firstname) {
        return res.status(400).json({
            success: false,
            message: 'Please Enter First Name'
        });
    } else {
        next();
    }
};

var requireLastname = function(req, res, next) {
    winston.info('inputController: require last name');

    if (!req.body.lastname) {
        return res.status(400).json({
            success: false,
            message: 'Please Enter Last Name'
        });
    } else {
        next();
    }
};

var requirePassword = function(req, res, next) {
    winston.info('inputController: require password');

    if (!req.body.password) {
        return res.status(400).json({
            success: false,
            message: 'Please Enter Password'
        });
    } else {
        next();
    }
};

var requireRole = function(req, res, next) {
    winston.info('inputController: require role');

    if (!req.body.new_role) {
        return res.status(400).json({
            success: false,
            message: 'Role Required'
        });
    } else if (req.body.new_role != roles.ADMIN && req.body.new_role != roles.INSTRUCTOR && req.body.new_role != roles.STUDENT) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Role'
        });
    } else {
        next();
    }
};

var requireTags = function(req, res, next) {
    winston.info('inputController: require tags');

    if (!req.body.tags) {
        return res.status(400).json({
            success: false,
            message: 'Please enter tags'
        });
    } else {
        next();
    }
};

var requireQuestionBody = function(req, res, next) {
    winston.info('inputController: require question body');

    if (!req.body.html_body) {
        return res.status(400).json({
            success: false,
            message: 'Please enter html body'
        });
    } else {
        next();
    }
};

var requireAnswerChoices = function(req, res, next) {
    winston.info('inputController: require answer choices');

    if (!req.body.answer_choices) {
        return res.status(400).json({
            success: false,
            message: 'Please enter answer choices'
        });
    } else {
        next();
    }
};

var requireAnswer = function(req, res, next) {
    winston.info('inputController: require answer');

    if (!req.body.answer) {
        return res.status(400).json({
            success: false,
            message: 'Please enter answer number'
        });
    } else {
        next();
    }
};



module.exports = {
    requireCourseKey: requireCourseKey,
    requireCourseSchedule: requireCourseSchedule,
    requireCourseTitle: requireCourseTitle,
    requireCurrentPassword: requireCurrentPassword,
    requireNewPassword: requireNewPassword,
    requireUsername: requireUsername,
    requireLastname: requireLastname,
    requireFirstname: requireFirstname,
    requirePassword: requirePassword,
    requirePreRegisterKey: requirePreRegisterKey,
    requireRole: requireRole,
    requireSections: requireSections,
    requireTags: requireTags,
    requireQuestionBody: requireQuestionBody,
    requireAnswerChoices: requireAnswerChoices,
};
