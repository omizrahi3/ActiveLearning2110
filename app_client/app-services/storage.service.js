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

app.factory('UserStorage', function($localStorage, jwtHelper) {

    var service = {};

    defVals = {
        _id: '',
        username: '',
        firstname: '',
        lastname: '',
        photo: '',
        role: 'student',
        courses: [],
        classExpand: false,
        LoggedIn: false,
        jwt_token: null,
        users: [],
        keys: [],
        notifications: {
            count: 0,
            data: []
        }
    };

    $localStorage.$default(defVals);

    service.UpdateUserInfo = function(data) {
        for (var key in data) {
            $localStorage[key] = data[key];
        }
    };

    service.UpdateSingleUserRole = function(username, role) {
        for (var key in $localStorage.users) {
            if ($localStorage.users[key].username === username) {
                $localStorage.users[key].role = role;
            }
        }
    };

    service.UpdateSingleUserDeact = function(username, value) {
        for (var key in $localStorage.users) {
            if ($localStorage.users[key].username === username) {
                $localStorage.users[key].deactivated = value;
            }
        }
    };

    service.UpdateSingleCourse = function(course) {
        for (var key in $localStorage.courses) {
            if ($localStorage.courses[key]._id === course._id) {
                $localStorage.courses[key] = course;
            }
        }
    };

    service.UpdateCourseLectures = function(course_id, lectures) {
        for (var key in $localStorage.courses) {
            if ($localStorage.courses[key]._id === course_id) {
                $localStorage.courses[key].lectures = lectures;
            }
        }
    };

    service.LoggedIn = function() {
        if ($localStorage.jwt_token && !jwtHelper.isTokenExpired($localStorage.jwt_token) && $localStorage.LoggedIn) {
            $localStorage.LoggedIn = true;
            return true;
        } else {
            $localStorage.LoggedIn = false;
            return false;
        }
    };

    service.FindSectionStudents = function(course, id) {
        for (var key in course.sections) {
            if (course.sections[key]._id === id) {
                return course.sections[key].students;
            }
        }
    };

    service.Clear = function() {
        $localStorage.$reset(defVals);
    };

    return service;

});
