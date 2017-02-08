/* jshint node: true */

//************************************************************
//  course.create.instructor.controller.js                  //
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

app.controller('Instructor.Course.Create.Controller', function($scope, $localStorage, $state, UserService) {

    $scope.course = {};

    $scope.prefixes = [{
        id: "1",
        name: "CS"
    }, {
        id: "2",
        name: "CE"
    }, {
        id: "3",
        name: "CM"
    }, {
        id: "4",
        name: "ME"
    },  {
        id: "5",
        name: "MA"
    }];

});
