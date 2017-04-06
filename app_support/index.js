/* jshint node: true */

//************************************************************
//  index.js                                                //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 9/18/16.                    //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  27Dec16     O. Mizrahi  Initial Design                  //
//                                                          //
//************************************************************
"use strict";

module.exports = function(app) {
  app.get('/Home', function(req, res){
    res.sendFile(__dirname + '/views/Home.html');
  });
};
