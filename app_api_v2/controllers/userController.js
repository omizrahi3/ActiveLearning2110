/* jshint node: true */

//************************************************************
//  userController.js                                       //
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

var roles =
{
    ADMIN       : 'admin',
    INSTRUCTOR  : 'instructor',
    STUDENT     : 'student',
};

var updateRole = function (req, res, next)
{
    console.log('userController updateRole');

    User.findById(req.params.USERID)
    .exec()
    .then(function(user){
        user.role = req.body.new_role;
        return user.save();
    })
    .then(function(user){
        return res.status(200).json(
            {
                success   : true,
                jwt_token : req.token,
                message   : 'User Role Updated',
                user      : user
            }
        );
    })
    .catch(function(err){
        return res.status(404).json(
            {
                success: false,
                message: 'Unable to Update User Role'
            }
        );
    });
};

var deactivateUser = function (req, res, next)
{
    console.log('userController deactivateUser');

    User.findById(req.params.USERID)
    .exec()
    .then(function(user){
        user.deactivated = !user.deactivated;
        return user.save();
    })
    .then(function(user){
        return res.status(200).json(
          {
              success   : true,
              jwt_token : req.token,
              message   : 'User Deactivation Updated',
              user      : user
          });
    })
    .catch(function(err){
        return res.status(404).json(
          {
              success: false,
              message: 'User Deactivation Unsuccessful'
          });
    });
};

var getAll  = function (req, res)
{
    console.log('userController getAll');

    User.find()
    .exec()
    .then(function(users){
        return res.status(200).json(
            {
                success   : true,
                jwt_token : req.token,
                user      : users,
                message   : "Success on getAll"
            }
        );
    })
    .catch(function(err){
        return res.status(500).json(
            {
                success: false,
                message: 'Internal Error'
            }
        );
    });
};

var getUser = function (req, res)
{
    console.log('userController getUser');

    User.findById(req.params.USERID)
    .exec()
    .then(function(user){
        user.password = undefined;
        user.__v = undefined;
        return res.status(200).json(
            {
                success   : true,
                jwt_token : req.token,
                message   : 'Request Success',
                user      : user
            }
        );
    })
    .catch(function(err){
        return res.status(404).json(
          {
              success: false,
              message: 'User Not Found'
          });
    });
};

var setUserName = function (req, res, next)
{
    console.log('userController setUserName');

    User.findById(req.decodedToken.sub, function(err, user)
    {
        if (err)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'User Not Found'
                }
            );
        }
        else
        {
            req.user = user;
            next();
        }
    });
}

var isValidStudent = function (req, res, next)
{
    console.log('userController isValidStudent');

    User.findOne({'username': req.body.username}, function (err, user)
    {
        if (err || !user)
        {
          console.log("Not found");
          req.body.password = "123456";
          req.instructorRegisteredStudent = true;
          next();
        }
        else
        {
          console.log("Found");
          req.student = user;
          next();
        }
    });
}

var updateUser = function (req, res)
{
    console.log('userController updateUser');

    User.findById(req.params.USERID)
    .exec()
    .then(function(user){
      return new Promise((resolve, reject)=>{
        if (req.body.new_role)
        {
            if (req.body.new_role === roles.ADMIN)
            {
                var error_message = new Error('Invalid Role');
                reject(error_message);
            }
        }
        resolve(user);
      });
    })
    .then(function(user){
        if (req.body.new_firstname)
        {
            user.firstname = req.body.new_firstname;
        }
        if (req.body.new_lastname)
        {
            user.lastname = req.body.new_lastname;
        }
        if (req.body.new_photo)
        {
            user.photo = req.body.new_photo;
        }
        if (req.body.new_password)
        {
            user.password = bcrypt.hashSync(req.body.new_photo, bcrypt.genSaltSync(10));
        }
        if (req.body.new_role)
        {
            user.role = req.body.new_role;
        }
        return user.save();
    })
    .then(function(user){
        return res.status(200).json(
            {
                success   : true,
                jwt_token : req.token,
                message   : 'User Updated',
                user      : user
            }
        );
    })
    .catch(function(err){
        return res.status(404).json(
          {
              success: false,
              message: err.message
          });
    });
};

var updatePassword = function(req, res)
{
    console.log('userController updatePassword');

    User.findById(req.params.USERID)
    .exec()
    .then(function(user){
        if (!bcrypt.compareSync(req.body.cur_password, user.password))
        {
            throw new Error('Invalid Password')
        }
        else
        {
            user.password = bcrypt.hashSync(req.body.new_password, bcrypt.genSaltSync(10));
            return user.save();
        }
    })
    .then(function(user){
        return res.status(200).json(
            {
                success   : true,
                jwt_token : req.token,
                message   : 'User Password Updated',
                user_id   : user._id.toString()
            }
        );
    })
    .catch(function(err){
        return res.status(404).json(
          {
              success: false,
              message: err.message
          });
    });
}

module.exports =
{
    deactivateUser  : deactivateUser,
    getAll          : getAll,
    getUser         : getUser,
    setUserName     : setUserName,
    updatePassword  : updatePassword,
    updateRole      : updateRole,
    updateUser      : updateUser,
    isValidStudent  : isValidStudent
};
