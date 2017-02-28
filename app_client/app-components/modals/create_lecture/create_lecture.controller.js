/* jshint node: true */

//************************************************************
//  create_course.controller.js                             //
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

app.controller('Create.Lecture.Controller', function($scope, $state, $stateParams, $element, $rootScope, $localStorage, RESTService) {

    $scope.loading = false;
    $scope.error = null;

    $rootScope.$stateParams = $stateParams;
    $scope.course = $localStorage.courses[$stateParams.selectedCourse];

    $scope.lecture = {
        title: null,
        date: null,
        date_day: null,
        day: null
    };

    $scope.create = function() {
        $scope.loading = true;
        RESTService.CreateLecture({
            course_id: $scope.course._id,
            data: {
                lecture_title: $scope.lecture.title,
                lecture_schedule: {
                    day: $scope.lecture.day,
                    date: $scope.lecture.date
                }
            }
        }, finishCreateLecture);
    };

    function finishCreateLecture(info) {
        $scope.loading = false;
        if (!info.success) {
            $scope.error = info.message;
            return;
        }
        $element.modal('hide');
    }

    $scope.$watch(function() {
        return $scope.lecture.date_day;
    }, function(newVal, oldVal) {
        if (newVal !== null) {
            data = newVal.split(",");
            $scope.lecture.date = data[0];
            $scope.lecture.day = data[1].toLowerCase();
        }
    });
});
