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

app.factory('SocketService', function(UserStorage) {

    var service = {};
    var lectureList_Socket = null;

    service.connectLectures = function() {
        lectureList_Socket = io('http://localhost:8081/lectures_list');
        lectureList_Socket.on('connect', function() {
            console.log('lecture socket connected');
        });
        lectureList_Socket.on('lectures_update', function(lecture_ids) {
            console.log(lecture_ids);
            UserStorage.LectureLiveUpdate(lecture_ids);
        });
        lectureList_Socket.on('disconnect', function(reason) {
            console.log('lecture socket disconnected ' + reason);
        });
    };

    service.startLecture = function(id) {
        lectureList_Socket.emit('start_lecture', id);
    };

    return service;

});
