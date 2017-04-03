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
    config = require('./../config');


exports = module.exports = function (io, lectures_list) {
    var lectures = io.of('/lectures_list').on('connection', function(socket){
        console.log('socketio lectures');
        socket.emit('lectures_update', JSON.stringify(lectures_list));

        socket.on('start_lecture', function(data){
            lectures_list.push(data);
            socket.broadcast.emit('lectures_update', JSON.stringify(lectures_list));
            socket.emit('lectures_update', JSON.stringify(lectures_list));
        });

        socket.on('end_lecture', function(data){
            for (var i = 0; i < lectures_list.length; i++) {
                if (lectures_list[i].lecture_id === data.lecture_id) {
                    lectures_list.splice(i, 1);
                }
            }
            socket.broadcast.emit('lectures_update', JSON.stringify(lectures_list));
            socket.emit('lectures_update', JSON.stringify(lectures_list));
        });
    });

    var live_lecture = io.of('/live_lecture').on('connection', function(socket){
        console.log('socketio live_lecture');

        socket.on('join_lecture', function(data){
            socket.username = data.username;
            socket.user_id = data.user_id;
            socket.role = data.user_role;
            socket.join(data.lecture_id);
            updateUserList(data.lecture_id);
        });

        socket.on('newQuestion', function(data){
            socket.broadcast.to(data.lecture_id).emit('questionFeed', JSON.stringify(data));
        });

        function updateUserList(lecture_id){
            var getUsers = io.of('/live_lecture').clients(lecture_id);
            socket.to(lecture_id).emit('updatedUsersList', JSON.stringify(getUsers));
        }
    });
};
