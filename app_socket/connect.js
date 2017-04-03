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
    var connect = io.on('connection', socketioJwt.authorize({
        secret: config.jwt_secret,
        timeout: 15000 // 15 seconds to send the authentication message
    }))
    .on('authenticated', function(socket) {
        console.log('hello! ' + JSON.stringify(socket.decoded_token));
    });
};
