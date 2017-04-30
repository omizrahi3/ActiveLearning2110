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

var config = require('./../config'),
    mongoose = require('mongoose'),
    Lecture = require('./../app_api_v2/models/lectureModel'),
    LiveLecture = require('./../app_api_v2/models/liveLectureModel'),
    Question = require('./../app_api_v2/models/questionModel'),
    Result = require('./../app_api_v2/models/resultModel');

exports = module.exports = function(io, winston) {
    var lectures = io.of('/lectures').on('connection', function(socket) {
        winston.info('Socket.io: Connection from: %s', socket.handshake.address);

        socket.on('lookup_lectures', function() {
            LiveLecture.find({}, {
                    lecture_id: 1
                })
                .exec()
                .then(getCurrentLiveLectures)
                .catch(function(err) {
                    return socket.emit('lectures_update', 'there seems to be a problem');
                });
        });

        socket.on('start_lecture', function(data) {
            winston.info('Socket.io: Starting Live Lecture: %s', data.lecture_id);

            // var newLiveLecture = new LiveLecture({
            //     lecture_id: lecture_id,
            //     instructor_socket: socket.id,
            // });

            // Lecture.findById(lecture_id, {"course_oid": 1})
            // .exec()
            // .then(function(lecture) {
            //     var newLiveLecture = new LiveLecture({
            //         lecture_id: lecture_id,
            //         instructor_socket: socket.id,
            //         course_oid: lecture.course_oid
            //     });
            //     return newLiveLecture.save();
            // })
            // .then(function(){
            //     return Lecture.update({_id: lecture_id}, {$set: {live: true}});
            // })
            // .then(function() {
            //     return LiveLecture.find({}, {
            //         lecture_id: 1,
            //         _id: 0
            //     });
            // })
            // .then(getCurrentLiveLectures)
            // .catch(function(err) {
            //     winston.error('Socket.io: Live Lecture Error: %s, %s', lecture_id, err);
            //     return lectures.emit('lectures_update', 'could not add lecture');
            // });

            var newLiveLecture = new LiveLecture({
                    lecture_id: data.lecture_id,
                    instructor_socket: socket.id,
                    course_oid: mongoose.Types.ObjectId(data.course_id),
              });

            newLiveLecture.save()
                .then(function() {
                    return Lecture.update(
                      {_id: data.lecture_id},
                      {$set: {live: true}});
                })
                .then(function() {
                    return LiveLecture.find({},
                      {lecture_id: 1,_id: 0}
                    );
                })
                .then(getCurrentLiveLectures)
                .catch(function(err) {
                    winston.error('Socket.io: Live Lecture Error: %s, %s', data.lecture_id, err);
                    return lectures.emit('lectures_update', 'could not add lecture');
                });
        });

        socket.on('stop_lecture', function() {
            clearRoom(socket.lecture_id);
        });

        socket.on('retire_lecture', function() {
            clearRoom(socket.lecture_id);
            retireLecture(socket.lecture_id);
        });

        socket.on('join_lecture', function(data) {
            LiveLecture.findOne({
                    lecture_id: data.lecture_id
                }, {
                    instructor_socket: 1,
                    current_question: 1,
                    course_oid: 1
                })
                .exec()
                .then(function(live_lecture) {
                    socket.instructor_socket = live_lecture.instructor_socket;
                    socket.course_oid = live_lecture.course_oid;
                    socket.username = data.username;
                    socket.user_id = data.user_id;
                    socket.role = data.user_role;
                    socket.lecture_id = data.lecture_id;
                    socket.join(data.lecture_id);
                    winston.info('Socket.io: Joining Live Lecture: %s, %s', socket.username, socket.lecture_id);
                    if (live_lecture.current_question) {
                        winston.info('Socket.io: Emitting Question that started to: %s', socket.username);
                        socket.emit('question_feed', live_lecture.current_question);
                    }
                    return emitUserNumer(data.lecture_id);
                }).catch(function(err) {
                    winston.error('Socket.io: join lecture error %s', err);
                });
        });

        socket.on('leave_lecture', function() {
            socket.leave(socket.lecture_id);
            emitUserNumer(socket.lecture_id);
        });

        socket.on('new_question', function(data) {
            winston.info('Socket.io: new question recieved: %j', data);
            Question.findById(data.question_id, {
                    "__v": 0,
                    "answer_choices.answer": 0
                })
                .exec()
                .then(function(question) {
                    data.question = question;
                    return LiveLecture.update({
                        lecture_id: socket.lecture_id
                    }, {
                        $set: {
                            current_question: data
                        }
                    });
                })
                .then(function(results) {
                    winston.info('Socket.io: emitting question to %s', socket.lecture_id);
                    return socket.broadcast.to(socket.lecture_id).emit('question_feed', data);
                })
                .catch(function(err) {
                    winston.error('Socket.io: Question Feed Error: %s', err);
                    return socket.emit('question_feed', 'error');
                });
        });

        socket.on('end_question', function() {
            LiveLecture.update({
                    lecture_id: socket.lecture_id
                }, {
                    $set: {
                        current_question: undefined
                    }
                })
                .exec()
                .then(function(results) {
                    winston.info('Socket.io: ending current question for %s', socket.lecture_id);
                    return socket.broadcast.to(socket.lecture_id).emit('end_question');
                });
        });

        socket.on('new_time', function(data) {
            winston.info('Socket.io: new time recieved from professor %j', data);
            LiveLecture.findOne({
                    lecture_id: socket.lecture_id
                }, {
                    current_question: 1
                })
                .exec()
                .then(function(liveLecture) {
                    var updatedQuestion = liveLecture.current_question;
                    updatedQuestion.end_time = data.time;
                    updatedQuestion.max_time = data.timeMax;
                    return LiveLecture.update({
                        lecture_id: socket.lecture_id
                    }, {
                        $set: {
                            current_question: updatedQuestion
                        }
                    });
                })
                .then(function(results) {
                    winston.info('Socket.io: new end time emiited to %s', socket.lecture_id);
                    return socket.broadcast.to(socket.lecture_id).emit('new_end', data);
                })
                .catch(function(err) {
                    winston.info('Socket.io: new end time error %s', err);
                    return socket.broadcast.to(socket.lecture_id).emit('new_end', 'error');
                });
        });

        socket.on('answer_question', function(data) {
            winston.info('Socket.io: answer recieved from %s: %j', socket.username, data.answer);
            var correct = Boolean(false);
            Question.findOne({
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
                    if (question.answer_choices[0].answer === true) {
                        correct = Boolean(true);
                    }
                    var newResult = new Result({
                        student_id: socket.user_id,
                        course_oid: socket.course_oid,
                        lecture_id: socket.lecture_id,
                        lecture_oid: mongoose.Types.ObjectId(socket.lecture_id),
                        question_id: data.question_id,
                        question_oid: question._id,
                        answer: data.answer,
                        correct: correct
                    });
                    return newResult.save();
                })
                .then(function(result) {
                    winston.info('Socket.io: answer result for %s: %s', socket.username, result.correct);
                    socket.emit('answer_result', result.correct);
                    return socket.broadcast.to(socket.instructor_socket).emit('new_answer', result.answer);
                })
                .catch(function(err) {
                    winston.error('Socket.io: answer result error: %s', err);
                    return socket.emit('answer_result', 'error');
                });
        });

        socket.on('disconnect', function() {
            if (socket.username) {
                winston.info('Socket.io: user disconnected: %s', socket.username);
                if (socket.role === 'instructor') {
                    winston.info('Socket.io: clearing live lecture %s', socket.lecture_id);
                    clearRoom(socket.lecture_id);
                } else {
                    emitUserNumer(socket.lecture_id);
                }
            }
        });

        function emitUserNumer(lecture) {
            var users = io.nsps['/lectures'].adapter.rooms[lecture];
            if (users) {
                winston.info('Socket.io: emitting live lecture: %s, updated user total: %d', lecture, users.length);
                socket.broadcast.to(socket.instructor_socket).emit('updated_user_total', users.length);
            }
        }

        function clearRoom(lecture) {
            var roomObj = io.nsps['/lectures'].adapter.rooms[lecture];
            if (roomObj) {
                Object.keys(roomObj.sockets).forEach(function(id) {
                    lectures.sockets[id].leave(lecture);
                });
            }
            stopLecture(lecture);
        }

        function stopLecture(lecture_id) {
            winston.info('Socket.io: ending live lecture: %s', lecture_id);

            LiveLecture.remove({
                    lecture_id: lecture_id
                })
                .then(function(data) {
                    return Lecture.update({
                        _id: lecture_id
                    }, {
                        $set: {
                            live: false
                        }
                    });
                })
                .then(function(lecture) {
                    return LiveLecture.find({}, {
                        lecture_id: 1
                    });
                })
                .then(getCurrentLiveLectures)
                .catch(function(err) {
                    winston.error('Socket.io: ending live lecture error: %s', err);
                    return lectures.emit('lectures_update', 'could not add lecture');
                });
        }

        function retireLecture(lecture_id) {
            winston.info('Socket.io: retiring live lecture: %s', lecture_id);

            Lecture.update({
                    _id: lecture_id
                }, {
                    $set: {
                        live: false,
                        post_lecture: true
                    }
                })
                .then(function(lecture) {
                    socket.emit('lecture_retired');
                })
                .catch(function(err) {
                    winston.error('Socket.io: retiring live lecture error: %s', err);
                    return lectures.emit('lectures_update', 'could not add lecture');
                });
        }

        function getCurrentLiveLectures(live_lectures) {
            var current_lectures = live_lectures.map(function(lecture) {
                return lecture.lecture_id;
            });
            return lectures.emit('lectures_update', JSON.stringify(current_lectures));
        }
    });
};
