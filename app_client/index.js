/* jshint node: true */

//****************************************************************
//  app_client/index.js                                         //
//  Active Learning 2110                                        //
//                                                              //
//  Created by Jeremy Carter on 10/08/16.                       //
//  Copyright © 2016 Jeremy Carter. All rights reserved.        //
//                                                              //
//  Date        Name        Description                         //
//  -------     ---------   --------------                      //
//  08Oct16     J.Carter    Initial Design                      //
//                                                              //
//****************************************************************

"use strict";
var jwt = require('jsonwebtoken');
var config = require('../config');

module.exports = function(app) {
    /**
    Respond to GET request

    - parameter PATH:       SPA route
    - parameter HANDLER:    callback
    */
    app.get('/', function(req, res) {
        res.render('index.html');
    });
};
