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

app.controller('Instructor.Live.Lecture.Controller', function($scope, $localStorage, $state, $stateParams, $rootScope, RESTService, ngNotify) {

    $scope.selectedQuestion = "";
    $scope.time = 60;
    $scope.timerEnabled = false;
    $rootScope.$stateParams = $stateParams;
    $scope.course = $localStorage.courses[$stateParams.selectedCourse];
    updateLectureInfo();

    RESTService.GetLectureInfo({
        lecture_id: $scope.lecture.lecture_id,
        course_id: $scope.course._id
    }, function(info) {
        if (!info.success) {
            ngNotify.set('Could not fetch lecture info', 'error');
            return;
        }
        $scope.lecture = $scope.course.lectures[$stateParams.selectedLecture];
    });

    function updateLectureInfo() {
        $scope.lecture = $scope.course.lectures[$stateParams.selectedLecture];
        $scope.questions = $scope.lecture.questions;
    }

    $scope.labels = [];
    $scope.data = [];

    $scope.randomize = function() {
        $scope.data = $scope.data.map(function(data) {
            return data.map(function(y) {
                y = y + Math.random() * 10 - 5;
                return parseInt(y < 0 ? 0 : y > 100 ? 100 : y);
            });
        });
    };

    $scope.datasetOverride = [
        {
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 2
        }
      ];
    $scope.options = {
        scales: {
            xAxes: [{
                gridLines: {
                    display: false,
                },
                barPercentage: 0.4,
                ticks: {
                    fontSize: 16,
                    fontStyle: "bold"
                }
            }],
            yAxes: [{
                id: 'y-axis-1',
                type: 'linear',
                display: true,
                position: 'left',
                ticks: {
                    fontSize: 16,
                    fontStyle: "bold",
                    suggestedMin: 0,
                    beginAtZero: true // minimum value will be 0.
                }
            }
          ]
        }
    };

    $scope.add10Seconds = function() {
        $scope.$broadcast('timer-add-cd-seconds', 10);
    };
    $scope.remove10Seconds = function() {
        $scope.time -= 10;
        if ($scope.time < 0) {
            $scope.time = 0;
        }
        $scope.$broadcast('timer-set-countdown-seconds', $scope.time);
    };
    $scope.startQuestion = function() {
        RESTService.GetQuestionDetails($scope.selectedQuestion, function(info) {
            if (!info.success) {
                ngNotify.set("Failed to fetch question details", 'error');
                return;
            }
            $scope.labels = [];
            $scope.data = [];
            var newData = [];
            $scope.choices = info.choices;
            console.log(info);
            for (var i in info.choices) {
                var correct = info.choices[i].answer ? " ✓" : " ✘";
                $scope.labels.push((parseInt(i) + 1).toString() + correct);
                newData.push(0);
            }
            $scope.data.push(newData);
            $scope.time = 60;
            $scope.timerEnabled = true;
            $scope.$broadcast('timer-set-countdown-seconds', $scope.time);
            $scope.$broadcast('timer-start');
        });
    };

    $scope.$on('timer-tick', function(event, data) {
        $scope.time = data.millis / 1000;
        if ($scope.time === 0) {
            $scope.timerEnabled = false;
        } else {
            $scope.timerEnabled = true;
        }
        $scope.randomize();
    });
});
