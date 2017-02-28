/* jshint node: true */

//****************************************************************
//  config/index.js                                             //
//  Active Learning 2110                                        //
//                                                              //
//  Created by Odell Mizrahi on 9/13/16.                        //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.        //
//                                                              //
//  Date        Name        Description                         //
//  -------     ---------   --------------                      //
//  02Oct16     O. Mizrahi  Initial Design                      //
//                                                              //
//****************************************************************
"use strict";

module.exports = {
    'database'        : 'mongodb://localhost/ActiveLearning2110',
    'jwt_secret'      : 'activelearning',
    'jwt_settings'    : {
                            expiresIn: '1hr'
                        }
};
