/* jshint node: true */

//************************************************************
//  dashboard.instructor.controller.js                      //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 02/03/17.                   //
//  Copyright © 2016 Jeremy Carter. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  03Feb17     J. Carter  Initial Design                   //
//                                                          //
//************************************************************

var app = angular.module('app');

app.controller('Instructor.Dashboard.Controller', function($scope, $localStorage, UserService) {

    $scope.createCourse = function() {
        UserService.ShowCreateCourse();
    };

});
