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

app.controller('Instructor.Live.Lecture.Controller', function($scope, $localStorage, $state, $stateParams, $rootScope, RESTService, SocketService, ngNotify) {

    $scope.selectedQuestion = "";
    $scope.time = 60;
    $scope.timeMax = 60;
    $scope.timerEnabled = false;
    $scope.end_time = 0;
    $rootScope.$stateParams = $stateParams;
    $scope.course = $localStorage.courses[$stateParams.selectedCourse];
    updateLectureInfo();

    $scope.$on("$destroy", function() {
        console.log('killing live lecture');
        SocketService.StopLecture($scope.lecture.lecture_id);
    });

    $rootScope.$on('student_answer', function(evnt, answer) {
        var indx = $scope.choices.indexOf(answer);
        $scope.data[0][idx]++;
    });

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
        if ($scope.time + 10 > $scope.timeMax) {
            $scope.timeMax = $scope.time + 10;
        }
        $scope.end_time.setSeconds($scope.end_time.getSeconds() + 10);
        SocketService.ChangeTime({
            lecture_id: $scope.lecture.lecture_id,
            time: $scope.end_time,
            timeMax: $scope.timeMax
        });
    };
    $scope.remove10Seconds = function() {
        if ($scope.time < 0) {
            $scope.time = 0;
        }
        $scope.end_time.setSeconds($scope.end_time.getSeconds() - 10);
        SocketService.ChangeTime({
            lecture_id: $scope.lecture.lecture_id,
            time: $scope.end_time
        });
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
            for (var i in info.choices) {
                var correct = info.choices[i].answer ? " ✓" : " ✘";
                $scope.labels.push((parseInt(i) + 1).toString() + correct);
                newData.push(0);
            }
            $scope.data.push(newData);
            $scope.timerEnabled = true;
            $scope.$broadcast('timer-set-countdown-seconds', $scope.time);
            var t = new Date();
            t.setSeconds(t.getSeconds() + $scope.time);
            $scope.end_time = t;
            SocketService.StartQuestion({
                lecture_id: $scope.lecture.lecture_id,
                question_id: $scope.selectedQuestion,
                max_time: $scope.timeMax,
                end_time: t
            });
            $scope.$broadcast('timer-start');
        });
    };

    $scope.$on('timer-tick', function(event, data) {
        var myTime = new Date();
        $scope.time = Math.round(($scope.end_time.getTime() - myTime.getTime()) / 1000);
        if ($scope.time <= 0) {
            $scope.$broadcast('timer-stop');
            $scope.selectedQuestion = "";
            $scope.time = 60;
            $scope.timeMax = 60;
            $scope.timerEnabled = false;
            $scope.end_time = 0;
        } else {
            $scope.timerEnabled = true;
        }
    });
});
