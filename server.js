/* jshint node: true */

//************************************************************
//  server.js                                               //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 9/13/16.                    //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  13Sep16     O. Mizrahi  Initial Design                  //
//  08Oct16     J. Carter   Added Sass Support              //
//  16Nov16     J. Carter   Added urlencoded to bodyparser  //
//  12Jan17     J. Carter   Removed unused libraries        //
//************************************************************
"use strict";

var app_api_v2 = require('./app_api_v2'),
    app_client = require('./app_client'),
    bodyparser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    express = require('express'),
    mongoose = require('mongoose'),
    path = require('path'),
    sessions = require('client-sessions'),
    config = require('./config'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    socketioJwt = require('socketio-jwt');

/**
Must have MongoDB installed and run mongod
*/
mongoose.Promise = global.Promise;
mongoose.connect(config.database);

io.sockets
  .on('connection', socketioJwt.authorize({
    secret: config.jwt_secret,
    timeout: 15000 // 15 seconds to send the authentication message
  })).on('authenticated', function(socket) {
    //this socket is authenticated, we are good to handle more events from it.
    console.log('hello! ' + JSON.stringify(socket.decoded_token));
  });

app.use(express.static(path.join(__dirname, '/app_client')));

app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(cookieParser());

app.use(bodyparser.json());

app_client(app);
app_api_v2(app);

/**
Binds and listens for connections on the specified host and port

- parameter PORT:       8081
- parameter HANDLER:    callback
**/
http.listen(process.env.PORT || 8081, function() {
    console.log('listening on port 8081');
});
