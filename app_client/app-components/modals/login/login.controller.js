/* jshint node: true */

//************************************************************
//  login.controller.js                                     //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 01/11/17.                   //
//  Copyright © 2016 Jeremy Carter. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  11Jan17     J. Carter  Initial Design                   //
//                                                          //
//************************************************************
var app = angular.module('app');

app.controller('Login.Controller', function($scope, $element, $localStorage, UserService, RESTService, close) {
    $scope.title = 'Login';
    $scope.email = null;
    $scope.password = null;
    $scope.passwordVerify = null;
    $scope.professorKey = null;
    $scope.error = null;
    $scope.loading = false;
    $scope.register = false;
    $scope.professor = false;

    $scope.toggleRegister = function() {
        $scope.error = null;
        $scope.title = $scope.title === 'Login' ? 'Register' : 'Login';
        if ($scope.register) {
            $scope.passwordVerify = null;
            $scope.professorKey = null;
        }
        $scope.register = !$scope.register;
    };

    $scope.professorClick = function() {
        $scope.error = null;
        $scope.professor = !$scope.professor;
    };

    $scope.submit = function() {
        $scope.loading = true;
        if ($scope.register) {
            var info = {
                firstname: $scope.firstname.trim(),
                lastname: $scope.lastname.trim(),
                username: $scope.email.trim(),
                password: $scope.password.trim(),
                professor: $scope.professor
            };
            if ($scope.professor) {
                info.key = $scope.professorKey.trim();
            }
            RESTService.Register(info, Login);
        } else {
            Login({success: true});
        }
    };

    function Login(info) {
        if (!failed(info)) {
            if (!info.success) {
                failed(text);
                return;
            }
            if ($scope.register) {
                $scope.toggleRegister();
            }
            var data = {
                username: $scope.email.trim(),
                password: $scope.password.trim(),
            };
            RESTService.Login(data, getInfo);
        }
    }

    function getInfo(info) {
        if (!failed(info)) {
            RESTService.GetUserInfo(getCourses);
        }
    }

    function getCourses(info) {
        if (!failed(info)) {
            if ($localStorage.role === 'admin') {
                RESTService.GetAllUsers(getKeys);
            } else {
                RESTService.GetCourseList(finalize);
            }
        }
    }

    function getKeys(info) {
        if (!failed(info)) {
            RESTService.GetAllKeys(finalize);
        }
    }

    function finalize(info) {
        if (!failed(info)) {
            $scope.loading = false;
            close(true);
        }
    }

    function failed(info) {
        if (!info.success) {
            $scope.loading = false;
            $scope.error = info.message;
            RESTService.Logout();
            return true;
        } else {
            return false;
        }
    }
});

app.directive('gatech', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(value) {
                var valid = false;
                if (value) {
                    valid = value.toLowerCase().includes('@gatech.edu');
                    ctrl.$setValidity('invalidGatech', valid);
                }
                return valid ? value : undefined;
            });
        }
    };
});

app.directive('verifypass', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function(value) {
                var valid = false;
                if (value) {
                    valid = value === scope.password;
                    ctrl.$setValidity('invalidEqPass', valid);
                }
                return valid ? value : undefined;
            });
        }
    };
});
