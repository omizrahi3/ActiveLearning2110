/* jshint node: true */

//************************************************************
//  join_course.controller.js                               //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 01/15/17.                   //
//  Copyright © 2016 Jeremy Carter. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  15Jan17     J. Carter  Initial Design                   //
//                                                          //
//************************************************************

var app = angular.module('app');

app.controller('JoinCourse.Controller', function($scope, $element, $localStorage, UserService) {

    $scope.course = null;
    $scope.error = null;
    $scope.loading = false;

    var handleStatus = function(error, text) {
        $scope.loading = false;
        $scope.error = text;
    };

    $scope.join = function() {
        $scope.error = null;
        $scope.loading = true;
        UserService.JoinCourseNoID($scope.course, joinCourse);
    };

    function joinCourse(result, status, text) {
        if (!result) {
            handleStatus(status, text);
            return;
        }
        $scope.loading = false;
        $element.modal('hide');
    }
});
