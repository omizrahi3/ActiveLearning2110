/* jshint node: true */

//************************************************************
//  courseController.js                                     //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 01/07/17.                   //
//  Copyright © 2017 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  07Jan17     O. Mizrahi  Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var User    = require('./../models/userModel');
var Course  = require('./../models/courseModel');
var Lecture  = require('./../models/lectureModel');
var rand    = require("random-key");

var roles =
{
    ADMIN       : 'admin',
    INSTRUCTOR  : 'instructor',
    STUDENT     : 'student',
};

var initialSetup = function(req, res, next)
{
    console.log('lectureController initialSetup');

    User.findById(req.decodedToken.sub, function(err, user)
    {
        var newCourse = null;

        var course_instructor =
        {
            instructor_id   : user._id.toString(),
            username        : user.username,
            firstname       : user.firstname,
            lastname        : user.lastname
        };

        newLecture = new Lecture(
        {
            title       : req.body.title,
            instructor  : course_instructor,
            schedule    : req.body.course_schedule,
            sections    : req.body.sections,
            course_key  : rand.generate()
        });

        newCourse.save(function(err, savedCourse)
        {
            if (err)
            {
                return res.status(500).json(
                    {
                        success: false,
                        message: err
                    }
                );
            }
            next();
        });
    });
}

module.exports =
{
    initialSetup        :         initialSetup
};
