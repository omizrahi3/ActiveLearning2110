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
        selectedCourse: 0,
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

    service.LoggedIn = function() {
        if ($localStorage.jwt_token && !jwtHelper.isTokenExpired($localStorage.jwt_token) && $localStorage.LoggedIn) {
            $localStorage.LoggedIn = true;
            return true;
        } else {
            $localStorage.LoggedIn = false;
            return false;
        }
    };

    service.Clear = function() {
        $localStorage.$reset(defVals);
    };

    return service;

});
