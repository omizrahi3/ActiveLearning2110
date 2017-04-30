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
    var liveSocket = null;
    var attempts = 0;

    service.connectToServer = function() {
        if (liveSocket === null) {
            liveSocket = io('http://localhost:8081/lectures');
            liveSocket.on('connect', function() {
                buildSocket();
                liveSocket.emit('lookup_lectures');
            });
        }
    };

    service.disconnect = function() {
        if (liveSocket !== null) {
            liveSocket.disconnect();
            liveSocket = null;
        }
    };

    service.getLecturesList = function() {
        if (liveSocket !== null) {
            liveSocket.emit('lookup_lectures');
        }
    };

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

    service.EndQuestion = function() {
        liveSocket.emit('end_question');
    };

    service.StartLecture = function(info) {
        liveSocket.emit('start_lecture', {
            lecture_id: info.lecture_id,
            course_id: info.course_id
        });
        service.JoinLiveLecture(info);
    };

    service.StopLecture = function() {
        liveSocket.emit('stop_lecture');
    };

    service.RetireLecture = function() {
        liveSocket.emit('retire_lecture');
    };

    service.LeaveLecture = function() {
        liveSocket.emit('leave_lecture');
    };

    service.AnswerQuestion = function(info) {
        liveSocket.emit('answer_question', info);
    };

    function buildSocket() {
        liveSocket.on('reconnect', function() {
            attempts = 0;
        });

        liveSocket.on('lectures_update', function(lecture_ids) {
            UserStorage.LectureLiveUpdate(lecture_ids);
        });

        liveSocket.on('question_feed', function(data) {
            $rootScope.$emit('new_question', data);
        });

        liveSocket.on('answer_result', function(data) {
            $rootScope.$emit('answer_result', data);
        });

        liveSocket.on('updated_user_total', function(total) {
            $rootScope.$emit('updated_user_total', total);
        });

        liveSocket.on('new_end', function(data) {
            $rootScope.$emit('new_end', data);
        });

        liveSocket.on('new_answer', function(answer) {
            $rootScope.$emit('new_answer', answer);
        });

        liveSocket.on('end_question', function() {
            $rootScope.$emit('end_question');
        });

        liveSocket.on('lecture_retired', function() {
            $rootScope.$emit('lecture_retired');
        });

        liveSocket.on('connect_error', function() {
            attempts++;
            if (attempts >= 7) {
                $rootScope.$emit('socketio_failed');
            }
        });
    }

    return service;

});
