/* jshint node: true */

//************************************************************
//  signupController.js                                     //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 01/03/17.                   //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  03Jan17     O. Mizrahi  Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var User            = require('./../models/userModel');
var RegistrationKey = require('./../models/keyModel');

var bcrypt  = require('bcryptjs');
var rand    = require("random-key");

var roles =
{
    ADMIN       : 'admin',
    INSTRUCTOR  : 'instructor',
    STUDENT     : 'student',
};

var keys =
{
    ADMIN       : 'adminKey',
    INSTRUCTOR  : 'instructorKey'
}

var bulkAdd = function (req, res, next)
{
    console.log('signupController bulkAdd');

    console.log(req.body.users);

    return res.status(201).json(
        {
            success   :   true,
            users     :   req.body.users

        }
    );
}

var createAdminKey = function (req, res, next)
{
    console.log('signupController createAdminKey');

    var adminCreator =
    {
        user_id:    req.decodedToken.sub
    };
    var newKey = new RegistrationKey(
    {
        role    :     roles.ADMIN,
        key     :     rand.generate(),
        admin_creator   :     adminCreator
    });

    newKey.save(function(err, savedKey)
    {
        if (err)
        {
            return res.status(500).json(
                {
                    success: false,
                    message: "Internal Error"
                }
            );
        }
        req.savedKey = savedKey;
        next();
    });
}

var getAllOnSuccess = function(req, res)
{
    console.log('signupController getAllOnSuccess');

    RegistrationKey.find({'admin_creator.user_id' : req.decodedToken.sub}, function(err, keys)
    {
        if (err || !keys)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'No keys Found'
                }
            );
        }
        else
        {
            return res.status(201).json(
                {
                    success   :   true,
                    jwt_token :   req.token,
                    message   :   'Admin Key Creation Successsful',
                    key       :   req.savedKey,
                    keys      :   keys

                }
            );
        }
    });

}

var createInstructorKey = function (req, res, next)
{
    console.log('signupController createInstructorKey');

    var adminCreator =
    {
        user_id:    req.decodedToken.sub
    };
    var newKey = new RegistrationKey(
    {
        role            :     roles.INSTRUCTOR,
        key             :     rand.generate(),
        admin_creator   :     adminCreator
    });
    newKey.save(function(err, savedKey)
    {
        if (err)
        {
            return res.status(500).json(
                {
                    success: false,
                    message: "Internal Error"
                }
            );
        }
        req.savedKey = savedKey;
        next();
    });
}

var getRegistrationKeys = function (req, res)
{
    console.log('signupController getRegistrationKeys');

    RegistrationKey.find({'admin_creator.user_id' : req.decodedToken.sub}, function(err, keys)
    {
        if (err || !keys)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'No keys Found'
                }
            );
        }
        else
        {
            return res.status(201).json(
                {
                    success   : true,
                    jwt_token : req.token,
                    message   : 'Request Sucess',
                    keys      : keys
                }
            );
        }
    });
}

var registerAdmin = function (req, res, next)
{
    console.log('signupController registerAdmin');

    if (req.body.username === 'admin@gatech.edu')
    {
        req.addUser = new User(
        {
            username:   req.body.username,
            password:   bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
            firstname:  req.body.firstname,
            lastname:   req.body.lastname,
            role    :   roles.ADMIN
        });
        next();
    }
    else if (req.query.role === roles.ADMIN)
    {
        var keyUser =
        {
            username:   req.body.username,
            firstname:  req.body.firstname,
            lastname:   req.body.lastname
        }
        RegistrationKey.findOneAndUpdate({ 'key': req.body.key, 'validated': false }, { 'validated': true, 'user': keyUser}, { 'new': true }, function (err, key)
        {
            if (err || !key)
            {
                return res.status(400).json(
                    {
                        success: false,
                        message: "Invalid Admin Registration Key"
                    }
                );
            }
            else
            {
                req.addUser = new User(
                {
                    username:   req.body.username,
                    password:   bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
                    firstname:  req.body.firstname,
                    lastname:   req.body.lastname,
                    role    :   roles.ADMIN
                });
                next();
            }
        });
      }
      else
      {
          next();
      }
};

var registerInstructor = function (req, res, next)
{
    console.log('signupController registerInstructor');

    if (req.query.role === roles.INSTRUCTOR)
    {
        var keyUser =
        {
            username:   req.body.username,
            firstname:  req.body.firstname,
            lastname:   req.body.lastname
        }
        RegistrationKey.findOneAndUpdate({ 'key': req.body.key, 'validated': false, 'role': roles.INSTRUCTOR}, {'validated': true, 'user': keyUser}, { 'new': true }, function (err, key)
        {
            if (err || !key)
            {
                return res.status(400).json(
                    {
                        success: false,
                        message: "Invalid Instructor Registration Key"
                    }
                );
            }
            else
            {
                console.log(key);
                req.addUser = new User(
                {
                    username:   req.body.username,
                    password:   bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
                    firstname:  req.body.firstname,
                    lastname:   req.body.lastname,
                    role    :   roles.INSTRUCTOR
                });
                next();
            }
        });
    }
    else
    {
        next();
    }
};

var registerStudent = function (req, res, next)
{
    console.log('signupController registerStudent');

    if (!req.addUser)
    {
        req.addUser = new User(
        {
            username:   req.body.username,
            password:   bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
            firstname:  req.body.firstname,
            lastname:   req.body.lastname,
            role    :   roles.STUDENT
        });
        next();
    }
    else
    {
        next();
    }
};

var preRegisterStudent = function (req, res, next)
{
    console.log('signupController preRegisterStudent');

    if (!req.instructorRegisteredStudent)
    {
        next();
    }
    else
    {
        var password = rand.generate();
        var pre_registered =
        {
            password    :   password,
            course_id   :   req.params.COURSEID,
            section_id  :   req.params.SECTIONID
        }
        var newUser = new User(
        {
            username          :   req.body.username,
            password          :   bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
            firstname         :   req.body.firstname,
            lastname          :   req.body.lastname,
            role              :   roles.STUDENT,
            pre_register_key  :   password,
            pre_registered    :   pre_registered
        });

        newUser.save(function(err, new_student)
        {
            if (err)
            {
                var errorMessage = 'Internal Error'
                if (err.code == '11000')
                {
                    errorMessage = 'Username Already Exist'
                }
                return res.status(500).json(
                    {
                        success: false,
                        message: errorMessage
                    }
                );
            }
            else
            {
                req.student = new_student;
                console.log(req.student);
                next();
            }
        });
    }
};

var savedUserToDB = function(req, res)
{
    console.log('signupController savedUserToDB');

    req.addUser.save(function(err, savedUser)
    {
        if (err)
        {
            var errorMessage = 'Internal Error'
            if (err.code == '11000')
            {
                errorMessage = 'Username Already Exist'
            }
            return res.status(500).json(
                {
                    success: false,
                    message: errorMessage
                }
            );
        }
        else
        {
            return res.status(201).json(
                {
                    success: true,
                    message: 'Registration Successsful',
                    id: savedUser._id.toString()
                }
            );
        }
    });
}

module.exports =
{
    bulkAdd                 :   bulkAdd,
    createAdminKey          :   createAdminKey,
    createInstructorKey     :   createInstructorKey,
    getRegistrationKeys     :   getRegistrationKeys,
    preRegisterStudent      :   preRegisterStudent,
    registerAdmin           :   registerAdmin,
    registerInstructor      :   registerInstructor,
    registerStudent         :   registerStudent,
    savedUserToDB           :   savedUserToDB,
    getAllOnSuccess         :   getAllOnSuccess
};
