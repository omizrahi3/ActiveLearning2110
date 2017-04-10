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

app.factory('SocketService', function($rootScope, UserStorage) {

    var service = {};
    var liveSocket = io('http://localhost:8081/lectures');

    liveSocket.on('connect', function() {
        console.log('lectures connected');
    });
    liveSocket.on('lectures_update', function(lecture_ids) {
        console.log(lecture_ids);
        UserStorage.LectureLiveUpdate(lecture_ids);
    });
    liveSocket.on('disconnect', function(reason) {
        console.log('lecture disconnected ' + reason);
    });

    liveSocket.on('question_feed', function(data) {
        console.log('new questions recieved');
        $rootScope.$emit('new_question', data);
    });

    liveSocket.on('question_result', function(data) {
        $rootScope.$emit('answer_result', data);
    });

    liveSocket.on('updated_user_total', function(total) {
        $rootScope.$emit('newUserTotal', total);
    });

    liveSocket.on('new_end', function(data) {
        $rootScope.$emit('new_end', data);
    });

    liveSocket.on('new_answer', function(answer) {
        $rootScope.$emit('new_answer', answer);
    });

    service.JoinLiveLecture = function(info) {
        liveSocket.emit('join_lecture', {
            username: info.username,
            user_id: info.user_id,
            user_role: info.user_role,
            lecture_id: info.lecture_id
        });
    };

    service.ChangeTime = function(data) {
        liveSocket.emit('new_time', data);
    };

    service.StartQuestion = function(question_id) {
        liveSocket.emit('new_question', question_id);
    };

    service.StartLecture = function(info) {
        liveSocket.emit('start_lecture', info.lecture_id);
        service.JoinLiveLecture(info);
    };

    service.StopLecture = function(id) {
        liveSocket.emit('end_lecture', id);
    };

    service.AnswerQuestion = function(info) {
        liveSocket.emit('answer_question', info);
    };

    return service;

});
