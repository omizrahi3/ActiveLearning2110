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

app.controller('Join.Course.Controller', function($scope, $element, $localStorage, RESTService) {

    $scope.section = null;
    $scope.error = null;
    $scope.loading = false;

    $scope.join = function() {
        $scope.error = null;
        $scope.loading = true;
        RESTService.JoinCourse({section_key: $scope.section}, finishJoinCourse);
    };

    function finishJoinCourse(info) {
        if (!info.success) {
            $scope.loading = false;
            $scope.error = info.message;
            return;
        }
        $scope.loading = false;
        $element.modal('hide');
    }
});
