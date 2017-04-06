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
    Lecture = require('./../app_api_v2/models/lectureModel');


exports = module.exports = function (io, lectures_list) {
    var lectures = io.of('/lectures_list').on('connection', function(socket){
        console.log('Connection made to /lectures_list');
        socket.emit('lectures_update', JSON.stringify(lectures_list));

        socket.on('start_lecture', function(lecture_id){
            if (lectures_list.indexOf(lecture_id) === -1) {
                Lecture.update({_id: lecture_id}, {$set: { live: true }})
                .then(function(result){
                    if (result.nModified !== 0) {
                        lectures_list.push(lecture_id);
                    }
                    lectures.emit('lectures_update', JSON.stringify(lectures_list));
                    socket.emit('lectures_update', JSON.stringify(lectures_list));
                });
            }
        });

        socket.on('end_lecture', function(lecture_id){
            if (lectures_list.indexOf(lecture_id) > -1) {
                Lecture.update({_id: lecture_id}, {$set: { live: false }})
                .then(function(result){
                    if (result.nModified !== 0) {
                        for (var i = 0; i < lectures_list.length; i++) {
                            if (lectures_list[i] === lecture_id) {
                                lectures_list.splice(i, 1);
                            }
                        }
                    }
                    lectures.emit('lectures_update', JSON.stringify(lectures_list));
                    socket.emit('lectures_update', JSON.stringify(lectures_list));
                });
            }
        });
    });

    var live_lecture = io.of('/live_lecture').on('connection', function(socket){
        console.log('Connection made to /live_lecture');

        socket.on('join_lecture', function(data){
            socket.username = data.username;
            socket.user_id = data.user_id;
            socket.role = data.user_role;
            socket.join(data.lecture_id);
            updateUserList(data.lecture_id, true);
        });

        socket.on('newQuestion', function(data){
            socket.broadcast.to(data.lecture_id).emit('questionFeed', JSON.stringify(data));
        });

        function updateUserList(lecture_id, broadcastToAll){
            var getUsers = io.of('/live_lecture').clients(lecture_id);
            var users = [];
            for (var i = 0; i < getUsers.length; i++) {
                users.push({user: getUsers[i].username, user_id: getUsers[i].user_id, role: getUsers[i].role});
            }
            socket.to(lecture_id).emit('updatedUsersList', JSON.stringify(users));

            if (broadcastToAll) {
                socket.broadcast.to(lecture_id).emit('updatedUsersList', JSON.stringify(users));
            }
        }

        socket.on('updateUserList', function(data){
            updateUserList(data.lecture_id);
        });
    });
};
