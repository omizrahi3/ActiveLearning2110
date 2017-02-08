/* jshint node: true */

//************************************************************
//  authenticaton.service.js                                //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 01/11/17.                   //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  11Jan17     J. Carter  Initial Design                   //
//                                                          //
//************************************************************

var app = angular.module('app');

app.factory('AuthenticationService', function($state, $http, $localStorage, UserService, jwtHelper) {

    var service = {};

    service.Login = function(info, callback) {

        $http.post('/api_v2/authenticate', info).then(function(response) {
                if (response.data.jwt_token) {
                    $localStorage.email = info.email;
                    $localStorage.token = response.data.jwt_token;
                    $localStorage.id = response.data.user_id;
                    $localStorage.LoggedIn = true;
                    $http.defaults.headers.common.Authorization = response.data.jwt_token;
                    callback(true, response.status, response.data.message);
                } else {
                    callback(false, response.status, response.data.message);
                }
            },
            function(response) {
                callback(false, response.status, response.data.message);
            }
        );
    };

    service.Register = function(info, callback) {
        var role = info.professor ? 'instructor' : undefined;
        var addr = role === 'instructor' ? '/api_v2/signup?role=' + role : '/api_v2/signup/';
        $http.post(addr, info).then(function(response) {
                callback(true, response.status, response.data.message);
            },
            function(response) {
                callback(false, response.status, response.data.message);
            }
        );
    };

    service.LoggedIn = function() {
        if ($localStorage.token && !jwtHelper.isTokenExpired($localStorage.token)) {
            $localStorage.LoggedIn = true;
            return true;
        } else {
            $localStorage.LoggedIn = false;
            return false;
        }
    };

    service.Logout = function() {
        if (service.LoggedIn()) {
            $http.delete('/api_v2/authenticate')
                .then(function() {

                    },
                    function() {

                    });
            UserService.ShowLogin();
        }
        UserService.Clear();
        $http.defaults.headers.common.Authorization = '';
    };

    return service;
});
