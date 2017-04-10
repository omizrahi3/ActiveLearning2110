/* jshint node: true */
/* jshint esversion: 6 */

//************************************************************
//  socketEvents.js                                         //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 9/18/16.                    //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  01Apr17     O. Mizrahi  Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var socketioJwt = require('socketio-jwt'),
    config = require('./../config'),
    Lecture = require('./../app_api_v2/models/lectureModel'),
    Question = require('./../app_api_v2/models/questionModel');

exports = module.exports = function(io, lectures_list) {
    var lectures = io.of('/lectures').on('connection', function(socket) {
        console.log('Connection made');
        socket.emit('lectures_update', JSON.stringify(lectures_list));

        socket.on('start_lecture', function(lecture_id) {
            console.log('start_lecture ' + lecture_id);
            if (lectures_list.indexOf(lecture_id) === -1) {
                Lecture.update({
                        _id: lecture_id
                    }, {
                        $set: {
                            live: true
                        }
                    })
                    .then(function(result) {
                        if (result.nModified !== 0) {
                            lectures_list.push(lecture_id);
                        }
                        lectures.emit('lectures_update', JSON.stringify(lectures_list));
                    });
            }
        });

        socket.on('end_lecture', function(lecture_id) {
            endLecture(lecture_id);
        });

        socket.on('join_lecture', function(data) {
            socket.username = data.username;
            socket.user_id = data.user_id;
            socket.role = data.user_role;
            socket.lecture_id = data.lecture_id;
            socket.join(data.lecture_id);
            console.log('joining: ' + data.lecture_id);
            emitUserNumer(data.lecture_id);
        });

        // reference: http://stackoverflow.com/questions/39880435/make-specific-socket-leave-the-room-is-in
        socket.on('leave_lecture', function(data) {
            socket.leave(data.lecture_id);
            emitUserNumer(data.lecture_id);
        });

        socket.on('new_question', function(data) {
            console.log('question:' + JSON.stringify(data));
            Question.findById(data.question_id, {
                    "__v": 0,
                    "answer_choices.answer": 0
                })
                .exec()
                .then(function(question) {
                    data.question = question;
                    socket.broadcast.to(data.lecture_id).emit('question_feed', data);
                })
                .catch(function(err) {
                    socket.emit('question_feed', 'error');
                });
        });

        socket.on('new_time', function(data) {
            console.log('time changed');
            socket.broadcast.to(data.lecture_id).emit('new_end', data);
        });

        socket.on('answer_question', function(data) {
            Question.find({
                    _id: data.question_id
                }, {
                    answer_choices: {
                        $elemMatch: {
                            text: data.answer
                        }
                    },
                    title: 0,
                    html_title: 0,
                    html_body: 0,
                    copied: 0,
                    tags: 0,
                    __v: 0
                })
                .exec()
                .then(function(question) {
                    if (question[0].answer_choices[0].answer === true) {
                        //answer is correct, emit to student they scored correctly
                        socket.emit('answer_result', true);
                    } else {
                        //answer is wrong, emit to student they scored incorrectly
                        socket.emit('answer_result', false);
                    }
                    //emit to instructor the updated stats
                })
                .catch(function(err) {
                    socket.emit('answer_result', 'error');
                });
        });

        socket.on('disconnect', function() {
            console.log("user disconnected: " + socket.username);
            if (socket.username) {
                if (socket.role === 'instructor') {
                    clearRoom(socket.lecture_id);
                } else {
                    emitUserNumer(socket.lecture_id);
                }
            }
        });

        //reference: http://stackoverflow.com/questions/9352549/getting-how-many-people-are-in-a-chat-room-in-socket-io#24425207
        function emitUserNumer(lecture) {
            var users = io.nsps['/lectures'].adapter.rooms[lecture];
            // var users = lectures.sockets.adapter.rooms[lecture];
            if (users) {
                console.log(users.length);
                socket.to(lecture).emit('updated_user_total', users.length);
            }
        }

        //reference: http://stackoverflow.com/questions/39880435/make-specific-socket-leave-the-room-is-in
        function clearRoom(lecture) {
            var roomObj = io.nsps['/lectures'].adapter.rooms[lecture];
            if (roomObj) {
                console.log('clearing room');
                Object.keys(roomObj.sockets).forEach(function(id) {
                    lectures.sockets[id].leave(lecture);
                });
                endLecture(lecture);
            }
        }

        function endLecture(lecture_id) {
            console.log('end_lecture ' + lecture_id);
            if (lectures_list.indexOf(lecture_id) > -1) {
                Lecture.update({
                        _id: lecture_id
                    }, {
                        $set: {
                            live: false
                        }
                    })
                    .then(function(result) {
                        if (result.nModified !== 0) {
                            for (var i = 0; i < lectures_list.length; i++) {
                                if (lectures_list[i] === lecture_id) {
                                    lectures_list.splice(i, 1);
                                }
                            }
                        }
                        lectures.emit('lectures_update', JSON.stringify(lectures_list));
                    });
            }
        }
    });
};
