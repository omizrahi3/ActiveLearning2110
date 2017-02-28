/* jshint node: true */

//************************************************************
//  socket.service.js                                       //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 01/12/17.                   //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  20Feb17     J. Carter  Initial Design                   //
//************************************************************
var app = angular.module('app');

app.factory('SocketService', function($localStorage) {

    var service = {};
    var socket = null;

    service.connect = function() {
        socket = io();
        socket.on('connect', function() {
            console.log('connected');
            socket.emit('authenticate', {
                token: $localStorage.jwt_token
            });
        })
        .on('authenticated', function() {
            console.log('YAYYYYYYY!');
        })
        .on('unauthorized', function() {
            console.log('SHIIIIIIIIT');
        });
    };

    service.on = function(eventName, callback) {
        socket.on(eventName, callback);
    };

    service.emit = function(eventName, data) {
        socket.emit(eventName, data);
    };

    return service;

});
