/* jshint node: true */

//************************************************************
//  live_lecture.controller.js                              //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 04/02/17.                   //
//  Copyright © 2016 Jeremy Carter. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  02Apr17     J. Carter  Initial Design                   //
//                                                          //
//************************************************************

var app = angular.module('app');

app.controller('Instructor.Review.Lecture.Controller', function($scope, $localStorage, $state, $stateParams, $rootScope, RESTService, UserService, ngNotify) {
    $rootScope.$stateParams = $stateParams;
    $scope.lecture_id = $stateParams.selectedLectureId;
    $scope.course = $localStorage.courses[$stateParams.selectedCourse];
    $scope.labels = [];
    $scope.data = [];
    $scope.colors = ['#ff6384'];

    RESTService.GetLectureInfo({
        lecture_id: $scope.lecture_id,
        course_id: $scope.course._id
    }, function(info) {
        if (!info.success) {
            ngNotify.set('Could not fetch lecture info', 'error');
            return;
        }
        $scope.lecture = $scope.course.lectures[$stateParams.selectedLecture];
        RESTService.GetLectureResults({
            lecture_id: $scope.lecture_id
        }, function(info) {
            if (!info.success) {
                ngNotify.set('Could not fetch lecture results', 'error');
                return;
            }
            var newData = [];
            info.results.forEach(function(result) {
                $scope.labels.push(getQuestionIndex(result._id));
                newData.push(result.class_average);
            });
            $scope.data.push(newData);
        });
    });


    $scope.datasetOverride = [{
        label: "Average",
        borderWidth: 3,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        type: 'line'
    }];

    $scope.options = {
        scales: {
            xAxes: [{
                ticks: {
                    fontSize: 16,
                    fontStyle: "bold"
                }
            }],
            yAxes: [{
                ticks: {
                    fontSize: 16,
                    fontStyle: "bold"
                }
            }],
        }
    };

    $scope.viewQuestion = function(selected_question) {
        RESTService.GetQuestionDetails(selected_question.question_id, function(info) {
            if (!info.success) {
                ngNotify.set('Could not fetch question details', 'error');
                return;
            }
            UserService.ShowQuestionPreview(info);
        });
    };

    function getQuestionIndex(id) {
        console.log($scope.lecture.questions);
        for (var i in $scope.lecture.questions) {
            if ($scope.lecture.questions[i].question_id === id) {
                return parseInt(i, 10) + 1;
            }
        }
        return -1;
    }
});
