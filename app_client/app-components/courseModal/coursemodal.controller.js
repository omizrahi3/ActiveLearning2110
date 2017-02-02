/* jshint node: true */

//************************************************************
//  coursemodal.controller.js                               //
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

app.controller('CourseModal.Controller', function($scope, $element, $localStorage, UserService) {

    $scope.course = null;
    $scope.error = null;
    $scope.loading = false;

    if ($localStorage.role === 'student') {
        $scope.btnTitle = 'Join';
        $scope.title = 'Register for Course';
        $scope.placeholder = 'Course Key';
    } else {
        $scope.title = 'Create Course';
        $scope.placeholder = 'Course Name';
        $scope.btnTitle = 'Create';
    }

    var handleStatus = function(error, text) {
        $scope.loading = false;
        $scope.error = text;
    };

    $scope.jnCreate = function() {
        $scope.error = null;
        $scope.loading = true;
        if ($localStorage.role === 'student') {
            UserService.JoinCourseNoID($scope.course, joinCourse);
        } else {
            UserService.CreateCourse($scope.course, createPost);
        }
    };

    function createPost(result, status, text) {
        if (!result) {
            handleStatus(status, text);
            return;
        }
        $scope.loading = false;
        $element.modal('hide');
    }

    function joinCourse(result, status, text) {
        if (!result) {
            handleStatus(status, text);
            return;
        }
        $scope.loading = false;
        $element.modal('hide');
    }
});
