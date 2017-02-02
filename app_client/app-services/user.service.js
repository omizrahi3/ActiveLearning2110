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

app.factory('UserService', function($http, $localStorage, $state, ModalService) {

    var service = {};

    var defVals = {
        id: '',
        email: '',
        firstname: '',
        lastname: '',
        photo: '',
        role: '',
        courses: [],
        selectedCourse: 0,
        classExpand: false,
        LoggedIn: false,
        notifications: {
            count: 0,
            data: []
        }
    };

    $localStorage.$default(defVals);

    service.ShowLogin = function() {
        ModalService.showModal({
            templateUrl: '/app-components/loginmodal/login.view.html',
            controller: 'Login.Controller'
        }).then(function(modal) {
            modal.element.modal({
                backdrop: 'static',
                keyboard: false
            });
            modal.close.then(function(result) {
                if (result) {
                    $('.modal-backdrop').remove();
                    $state.go('main.dashboard');
                }
            });
        });
    };

    service.ShowProfile = function() {
        ModalService.showModal({
            templateUrl: '/app-components/profilemodal/profile.view.html',
            controller: 'Profile.Controller'
        }).then(function(modal) {
            modal.element.modal();
        });
    };

    service.ShowACCourse = function() {
        ModalService.showModal({
            templateUrl: '/app-components/coursemodal/coursemodal.view.html',
            controller: 'CourseModal.Controller'
        }).then(function(modal) {
            modal.element.modal();
        });
    };

    service.GetUserInfo = function(callback) {
        $http.get('/api_v2/user/' + $localStorage.id)
            .then(function(response) {
                    syncUserInfo(response);
                    //updateToken(response.data.jwt_token);
                    callback(true, response.status, response.data.message);
                },
                function(response) {
                    callback(false, response.status, response.data.message);
                }
            );
    };

    service.GetCourseList = function(callback) {
        $http.get('api_v2/user/' + $localStorage.id + '/courses')
            .then(function(response) {
                    $localStorage.courses = response.data.courses;
                    //updateToken(response.data.jwt_token);
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
                    //updateToken(response.data.jwt_token);
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
                    //updateToken(response.data.jwt_token);
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
                    //updateToken(response.data.jwt_token);
                    callback(true, response.status, response.data.message);
                },
                function(response) {
                    callback(false, response.status, response.data.message);
                });
    };

    service.UpdateUserPass = function(info, callback) {
        $http.post('/api_v2/user/' + $localStorage.id + '/password', info)
            .then(function(response) {
                    //updateToken(response.data.jwt_token);
                    callback(true, response.status, response.data.message);
                },
                function(response) {
                    callback(false, response.status, response.data.message);
                });
    };

    service.Clear = function() {
        $localStorage.$reset(defVals);
    };

    function updateToken(token) {
        $localStorage.token = token;
        $http.defaults.headers.common.Authorization = token;
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
