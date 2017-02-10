/* jshint node: true */

//************************************************************
//  rest.service.js                                         //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 01/12/17.                   //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  08Feb17     J. Carter  Initial Design                   //
//************************************************************
var app = angular.module('app');

app.factory('RESTService', function($http, $localStorage, $state, Restangular, UserStorage, UserService) {

    var service = {};

    var baseREST = Restangular.all("api_v2");

    service.Register = function(info, callback) {
        var signup = null;
        if (info.professor) {
            signup = {role: 'instructor'};
        }
        baseREST.customPOST(info, "signup", signup).then(
            function(response) {
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.Login = function(info, callback) {
        baseREST.one("authenticate").post("", info).then(
            function(response) {
                Restangular.setDefaultHeaders({
                    token: response.jwt_token
                });
                var data = {
                    username: info.username,
                    _id: response.user_id,
                    jwt_token: response.jwt_token,
                    LoggedIn: true
                };
                UserStorage.UpdateUserInfo(data);
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            });
    };

    service.GetUserInfo = function(callback) {
        baseREST.one("user", $localStorage._id).get().then(
            function(response) {
                UserStorage.UpdateUserInfo(response.user);
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.GetCourseList = function(callback) {
        baseREST.one("user", $localStorage._id).one("courses").get().then(
            function(response) {
                UserStorage.UpdateUserInfo({courses: response.courses});
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.GetAllUsers = function(callback) {
        baseREST.one("user").get().then(
            function(response) {
                UserStorage.UpdateUserInfo({users: response.user});
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.GetAllKeys = function(callback) {
        baseREST.one("signup").one("registration_key").get().then(
            function(response) {
                UserStorage.UpdateUserInfo({keys: response.keys});
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.GenerateInstructorKey = function(callback) {
        baseREST.one("signup").one("instructor_key").post().then(
            function(response) {
                UserStorage.UpdateUserInfo({keys: response.keys});
                var retInfo = genRetInfo(response);
                retInfo.key = response.key.key;
                callback(retInfo);
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.UpdateUserInfo = function(info, callback) {
        baseREST.one("user", $localStorage._id).post("", info).then(
            function(response) {
                UserStorage.UpdateUserInfo(response.user);
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.UpdateUserPass = function(info, callback) {
        baseREST.one("user", $localStorage._id).one("password").post("", info).then(
            function(response) {
                console.log(response);
                callback(genRetInfo(response));
            },
            function(response) {
                console.log(response);
                callback(genRetInfo(response));
            }
        );
    };

    service.UpdateUserRole = function(info, callback) {
        baseREST.one("user", info.id).one("role").post("", {new_role: info.new_role}).then(
            function(response) {
                var retInfo = genRetInfo(response);
                retInfo.key = info.key;
                UserStorage.UpdateSingleUserRole(info.key, response.user.role);
                callback(retInfo);
            },
            function(response) {
                var retInfo = genRetInfo(response);
                retInfo.key = info.key;
                callback(retInfo);
            }
        );
    };

    service.UpdateUserDeactivation = function(info, callback) {
        baseREST.one("user", info.id).one("deactivate").post().then(
            function(response) {
                var retInfo = genRetInfo(response);
                retInfo.key = info.key;
                UserStorage.UpdateSingleUserDeact(info.key, response.user.deactivated);
                callback(retInfo);
            },
            function(response) {
                var retInfo = genRetInfo(response);
                retInfo.key = info.key;
                callback(retInfo);
            }
        );
    };

    service.CreateCourse = function(info, callback) {
        baseREST.one("course").post("", info).then(
            function(response) {
                UserStorage.UpdateUserInfo({courses: response.courses});
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.Logout = function() {
        if (UserStorage.LoggedIn()) {
            baseREST.one("authenticate").remove();
            UserService.ShowLogin();
        }
        UserStorage.Clear();
        Restangular.setDefaultHeaders({
            token: ""
        });
    };

    function genRetInfo(response) {
        if (response.message) {
            return {
                message: response.message,
                success: response.success
            };
        } else {
            return {
                message: response.data.message,
                success: response.data.success
            };
        }
    }

    return service;

});
