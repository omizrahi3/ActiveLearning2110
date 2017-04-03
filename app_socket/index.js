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

exports = module.exports = function (io) {
    var connection = io.on('connection', socketioJwt.authorize({
        secret: config.jwt_secret,
        timeout: 15000 // 15 seconds to send the authentication message
    }))
    .on('authenticated', function(socket) {
        console.log('hello! ' + JSON.stringify(socket.decoded_token));
    });
};

/*
var lecture_list = function(io, live_lectures) {
    io.of('/lecture_list').on('connection', socketioJwt.authorize({
        secret: config.jwt_secret,
        timeout: 15000
    }));
    io.sockets.on('authenticated', function (socket) {
        console.log("connection on /lecture_list");

        socket.on('start_lecture', function(data){
            live_lectures.push(data);
            socket.broadcast.emit('lectures_update', JSON.stringify(live_lectures));
            socket.emit('lectures_update', JSON.stringify(live_lectures));
        });

        socket.on('end_lecture', function(data){
            socket.broadcast.emit('lectures_update', JSON.stringify(live_lectures));
            socket.emit('lectures_update', JSON.stringify(live_lectures));
        });
    });
};

var live_lecture = function(io) {
    io.of('/live_lecture').on('connection', socketioJwt.authorize({
        secret: config.jwt_secret,
        timeout: 15000
    }));
    io.sockets.on('authenticated', function (socket) {
        console.log("connection on /live_lecture");

        socket.on('join_lecture', function(data){
            socket.username = data.username;
            socket.user_id = JSON.stringify(socket.decoded_token.sub);
            socket.role = JSON.stringify(socket.decoded_token.role);
            socket.join(data.lecture_id);
            updateUserList(data.lecture_id);
        });

        socket.on('new_question', function(data){
            socket.broadcast.to(data.lecture_id).emit('question', JSON.stringify(data));
        });

        function updateUserList(live_lecture){
            var getUsers = io.of('/livelecture').clients(live_lecture);
            socket.to(live_lecture).emit('updatedUsersList', JSON.stringify(getUsers));
        }
    });
};

var authenticate = function(io) {
    io.on('connection', socketioJwt.authorize({
        secret: config.jwt_secret,
        timeout: 15000
    }))
    .on('authenticated', function(socket) {
        console.log('Connection on /');
    });
};

module.exports = {
    authenticate: authenticate,
    lecture_list : lecture_list,
    live_lecture : live_lecture
};
*/

/*
exports = module.exports = function (io) {

  io.of('/thisshouldnotwork').on('connection', socketioJwt.authorize({
      secret: config.jwt_secret,
      timeout: 15000
  }));

  var connected = io.sockets.on('authenticated', function (socket) {
      console.log('hello! ' + JSON.stringify(socket.decoded_token));
  });

};
*/
