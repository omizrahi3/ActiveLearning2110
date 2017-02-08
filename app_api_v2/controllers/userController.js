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

    User.findById(req.params.USERID, function(err, user)
    {
        if (err || !user)
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
            user.role = req.body.new_role;
            user.save(function(err, updated_user)
            {
                if (err)
                {
                    return res.status(401).json(
                        {
                            success : false,
                            message : 'User Not Updated'
                        }
                    );
                }
                else
                {
                    return res.status(200).json(
                        {
                            success   : true,
                            jwt_token : req.token,
                            message   : 'User Role Updated',
                            user      : updated_user
                        }
                    );
                }
            });
        }
    });
};

var deactivateUser = function (req, res, next)
{
    console.log('userController deactivateUser');

    User.findById(req.params.USERID, function(err, user)
    {
        if (err || !user)
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
            user.deactivated = !user.deactivated;
            user.save(function(err, updated_user)
            {
                if (err)
                {
                    return res.status(401).json(
                        {
                            success : false,
                            message : 'User Not Updated'
                        }
                    );
                }
                else
                {
                    return res.status(200).json(
                        {
                            success   : true,
                            jwt_token : req.token,
                            message   : 'User Deactivation Updated',
                            user      : updated_user
                        }
                    );
                }
            });
        }
    });
};

var deleteUser = function (req, res, next)
{
    console.log('userController deleteUser');

    User.findById(req.params.USERID, function(err, user)
    {
        if (err || !user)
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
            user.remove(function(err)
            {
                if (!err)
                {
                    console.log('test'+req.user);
                    if (req.decodedToken.role !== roles.ADMIN)
                    {
                        //remove token
                        req.user_deleted = true;
                        next();
                    }
                    else
                    {
                        return res.status(200).json(
                            {
                                success   : true,
                                jwt_token : req.token,
                                message   : 'User Deleted'
                            }
                        );
                    }
                }
            });
        }
    });
};

var getAll  = function (req, res)
{
    console.log('userController getAll');

    User.find(function(err, users)
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
        else
        {
            return res.status(200).json(
                {
                    success   : true,
                    jwt_token : req.token,
                    user      : users,
                    message   : "Success on getAll"
                }
            );
        }
    });
};

var getUser = function (req, res)
{
    console.log('userController getUser');

    User.findById(req.params.USERID, function(err, user)
    {
        if (err || !user)
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
        }
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
          req.body.password = "123456";
          req.instructorRegisteredStudent = true;
          next();
        }
        else
        {
          req.user = user;
          next();
        }
    });
}

var updateUser = function (req, res)
{
    User.findById(req.params.USERID, function(err, user)
    {
        if (err || !user)
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
                if (req.body.new_role !== roles.INSTRUCTOR || req.body.new_role !== roles.STUDENT)
                {
                    return res.status(401).json(
                        {
                            success: false,
                            message: 'Invalid Role'
                        }
                    );
                }
                else
                {
                    user.role = req.body.new_role;
                }
            }
            user.save(function(err, updated_user)
            {
                if (err)
                {
                    return res.status(401).json(
                        {
                            success : false,
                            message : 'User Not Updated'
                        }
                    );
                }
                else
                {
                    return res.status(200).json(
                        {
                            success   : true,
                            jwt_token : req.token,
                            message   : 'User Updated',
                            user      : updated_user
                        }
                    );
                }
            });
        }
    });
};

var updatePassword = function(req, res)
{
  User.findById(req.params.USERID, function(err, user)
  {
      if (err || !user)
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
          if (!bcrypt.compareSync(req.body.cur_password, user.password))
          {
              return res.status(401).json(
                  {
                      success: false,
                      message: 'Incorrect Current Password'
                  }
              );
          }
          else
          {
              user.password = bcrypt.hashSync(req.body.new_password, bcrypt.genSaltSync(10));
              user.save(function(err, updated_user)
              {
                  if (err)
                  {
                      return res.status(401).json(
                          {
                              success : false,
                              message : 'User Password Not Updated'
                          }
                      );
                  }
                  else
                  {
                      return res.status(200).json(
                          {
                              success   : true,
                              jwt_token : req.token,
                              message   : 'User Password Updated',
                              user_id   : updated_user._id.toString()
                          }
                      );
                  }
              });
          }
      }
  });
}

var completePreRegistration = function (req, res, next)
{
    console.log('userController completePreRegistration');

    User.findOne({'pre_register_key' : req.body.pre_register_key}, function(err, user)
    {
        if (err || !user)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Pre Registration Key Not Valid'
                }
            );
        }
        else
        {
            user.pre_register_key = undefined;
            user.save(function(err, updated_user)
            {
                if (err)
                {
                    return res.status(401).json(
                        {
                            success : false,
                            message : 'Pre Registration Key Not Updated'
                        }
                    );
                }
                else
                {

                    req.user = updated_user;
                    next();
                    /*
                    return res.status(200).json(
                        {
                            success   : true,
                            message   : 'Registration Validated',
                            user_id   : updated_user._id.toString()
                        }
                    );
                    */
                }
            });
        }
    });
}

module.exports =
{
    completePreRegistration : completePreRegistration,
    deactivateUser  : deactivateUser,
    deleteUser      : deleteUser,
    getAll          : getAll,
    getUser         : getUser,
    setUserName     : setUserName,
    updatePassword  : updatePassword,
    updateRole      : updateRole,
    updateUser      : updateUser,
    isValidStudent  : isValidStudent
};
