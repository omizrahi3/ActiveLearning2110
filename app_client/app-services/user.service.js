/* jshint node: true */

//************************************************************
//  user.service.js                                         //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 01/12/17.                   //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  12Jan17     J. Carter  Initial Design                   //
//  15Jan17     J. Carter  Moved in ShowLogin & created     //
//                          ShowACCourse                    //
//************************************************************
var app = angular.module('app');

app.factory('UserService', function($http, $localStorage, $state, $ocLazyLoad, ModalService) {

    var service = {};

    defVals = {
        id: '',
        email: '',
        firstname: '',
        lastname: '',
        photo: '',
        role: 'student',
        courses: [],
        selectedCourse: 0,
        classExpand: false,
        LoggedIn: false,
        users: [],
        keys: [],
        notifications: {
            count: 0,
            data: []
        }
    };

    $localStorage.$default(defVals);

    service.ShowLogin = function() {
        ModalService.showModal({
            templateUrl: '/app-components/modals/login/login.view.html',
            controller: 'Login.Controller'
        }).then(function(modal) {
            modal.element.modal({
                backdrop: 'static',
                keyboard: false
            });
            modal.close.then(function(result) {
                if (result) {
                    $('.modal-backdrop').remove();
                    $state.go('main.' + $localStorage.role);
                }
            });
        });
    };

    service.ShowProfile = function() {
        ModalService.showModal({
            templateUrl: '/app-components/modals/profile/profile.view.html',
            controller: 'Profile.Controller'
        }).then(function(modal) {
            modal.element.modal();
        });
    };

    service.ShowJoinCourse = function() {
        ModalService.showModal({
            templateUrl: '/app-components/modals/join_course/join_course.view.html',
            controller: 'JoinCourse.Controller'
        }).then(function(modal) {
            modal.element.modal();
        });
    };

    service.GetUserInfo = function(callback) {
        $http.get('api_v2/user/' + $localStorage.id)
            .then(function(response) {
                    syncUserInfo(response);
                    //updateToken(response);
                    //console.log(response);
                    callback(true, response.status, response.data.message);
                },
                function(response) {
                    callback(false, response.status, response.data.message);
                }
            );
    };

    service.GetCourseList = function(callback) {
        $http.get('/api_v2/user/' + $localStorage.id + '/courses')
            .then(function(response) {
                    $localStorage.courses = response.data.courses;
                    //updateToken(response);
                    //console.log(response);
                    //why does this say 'created' for statusText?
                    callback(true, response.status, response.data.message);
                },
                function(response) {
                    callback(false, response.status, response.data.message);
                }
            );
    };

    service.CreateCourse = function(name, callback) {
        $http.post('/api_v2/course', {
                title: name
            })
            .then(function(response) {
                    $localStorage.courses = response.data.courses;
                    //updateToken(response);
                    //console.log(response);
                    callback(true, response.status, response.data.message);
                },
                function(response) {
                    callback(false, response.status, response.data.message);
                }
            );
    };

    service.JoinCourseNoID = function(key, callback) {
        $http.post('/api_v2/course/students', {
                course_key: key
            })
            .then(function(response) {
                    $localStorage.courses = response.data.courses;
                    //updateToken(response);
                    //console.log(response);
                    callback(true, response.status, response.data.message);
                },
                function(response) {
                    callback(false, response.status, response.data.message);
                });
    };

    service.UpdateUserInfo = function(info, callback) {
        $http.post('/api_v2/user/' + $localStorage.id, info)
            .then(function(response) {
                    syncUserInfo(response);
                    //updateToken(response);
                    //console.log(response);
                    callback(true, response.status, response.data.message);
                },
                function(response) {
                    callback(false, response.status, response.data.message);
                });
    };

    service.UpdateUserPass = function(info, callback) {
        $http.post('/api_v2/user/' + $localStorage.id + '/password', info)
            .then(function(response) {
                    //updateToken(response);
                    //console.log(response);
                    callback(true, response.status, response.data.message);
                },
                function(response) {
                    callback(false, response.status, response.data.message);
                });
    };

    service.GetAllUsers = function(callback) {
        $http.get('/api_v2/user')
            .then(function(response) {
                $localStorage.users = response.data.user;
                //console.log(response);
                callback(true, response.status, response.data.message);
            },
            function(response) {
                callback(false, response.status, response.data.message);
            });
    };

    service.GenerateInstructorKey = function(callback) {
        $http.post('/api_v2/signup/instructor_key')
            .then(function(response) {
                $localStorage.keys = response.data.keys;
                callback(true, response.status, response.data);
            },
            function(response) {
                callback(false, response.status, response.data.message);
            });
    };

    service.GetAllKeys = function(callback) {
        $http.get('/api_v2/signup/registration_key')
            .then(function(response) {
                $localStorage.keys = response.data.keys;
                //console.log(response);
                callback(true, response.status, response.data.message);
            },
            function(response) {
                callback(false, response.status, response.data.message);
            });
    };

    service.UpdateUserRole = function(info, callback) {
        $http.post('/api_v2/user/' + info.id + '/role', {
            "new_role": info.new_role
        })
            .then(function(response) {
                var retInfo = genRetInfo(response, true);
                retInfo.key = info.key;
                for (var key in $localStorage.users) {
                    if ($localStorage.users[key].username === info.key) {
                        $localStorage.users[key].role = info.new_role;
                    }
                }
                callback(retInfo);
            },
            function(response) {
                var retInfo = genRetInfo(response, false);
                retInfo.key = info.key;
                callback(retInfo);
            });
    };

    service.UpdateUserDeactivation = function(info, callback) {
        $http.post('/api_v2/user/' + info.id + '/deactivate')
            .then(function(response) {
                console.log(response);
                var retInfo = genRetInfo(response, true);
                retInfo.key = info.key;
                for (var key in $localStorage.users) {
                    if ($localStorage.users[key].username === info.key) {
                        $localStorage.users[key].deactivated = response.data.user.deactivated;
                    }
                }
                callback(retInfo);
            },
            function(response) {
                var retInfo = genRetInfo(response, false);
                retInfo.key = info.key;
                callback(retInfo);
            });
    };

    service.Clear = function() {
        $localStorage.$reset(defVals);
    };

    function genRetInfo(response, result) {
        return  {
            "status": response.status,
            "message": response.data.message,
            "result": result
        };
    }

    function updateToken(response) {
        $localStorage.token = response.data.jwt_token;
        $http.defaults.headers.common.Authorization = response.data.jwt_token;
    }

    function syncUserInfo(new_info) {
        $localStorage.id = new_info.data.user._id;
        $localStorage.email = new_info.data.user.username;
        $localStorage.photo = new_info.data.user.photo;
        $localStorage.role = new_info.data.user.role;
        $localStorage.firstname = new_info.data.user.firstname;
        $localStorage.lastname = new_info.data.user.lastname;
    }

    return service;
});
