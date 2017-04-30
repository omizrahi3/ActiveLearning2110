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
    $scope.choices = [];
    $scope.title = '';
    $scope.body = '';
    $scope.tags = [];
    $scope.selectedQuestion = '';
    $scope.time = 60;
    $scope.timeMax = 60;
    $scope.timerEnabled = false;
    $scope.end_time = 0;
    $scope.numOfStudents = 0;
    $scope.questionBtnTitle = 'Start Question';
    $rootScope.$stateParams = $stateParams;
    $scope.course = $localStorage.courses[$stateParams.selectedCourse];
    updateLectureInfo();

    $scope.$on("$destroy", function() {
        SocketService.StopLecture();
    });

    $rootScope.$on('updated_user_total', function(evt, total) {
        $scope.$apply(function() {
            $scope.numOfStudents = total - 1;
        });
        var cur = $scope.options.scales.yAxes[0].ticks.max;
        if (total > cur - 5) {
            $scope.$apply(function() {
                $scope.options.scales.yAxes[0].ticks.max = total + 5;
            });
        }
    });

    $rootScope.$on('new_answer', function(evt, answer) {
        var choices = $scope.choices.map(function(choice) {
            return choice.text;
        });
        var indx = choices.indexOf(answer);
        if (indx > -1) {
            $scope.data[0][indx]++;
        }
    });

    $rootScope.$on('lecture_retired', function() {
        RESTService.GetLectureInfo({
            lecture_id: $scope.lecture._id,
            course_id: $scope.course._id
        }, function(info) {
            if (!info.success) {
                ngNotify.set('Could not end lecture', 'error');
                return;
            }
            RESTService.GetCourseInfo($scope.course._id, function(info) {
                $state.go('main.' + $localStorage.role);
            });
        });
    });

    RESTService.GetLectureInfo({
        lecture_id: $scope.lecture._id,
        course_id: $scope.course._id
    }, function(info) {
        if (!info.success) {
            ngNotify.set('Could not fetch lecture info', 'error');
            return;
        }
        $scope.lecture = $scope.course.lectures[$stateParams.selectedLecture];
        $scope.lecture.questions.push({
            title: 'End Live Lecture',
            question_id: 'endLiveLecture'
        });
    });

    function updateLectureInfo() {
        $scope.lecture = $scope.course.lectures[$stateParams.selectedLecture];
        $scope.questions = $scope.lecture.questions;
    }

    $scope.labels = [];
    $scope.data = [];

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
                        max: 10,
                        fontSize: 16,
                        fontStyle: "bold",
                        suggestedMin: 0,
                        scaleSteps: 1,
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
        $scope.end_time = moment($scope.end_time).add(10, 'seconds').format();
        SocketService.ChangeTime({
            time: $scope.end_time,
            timeMax: $scope.timeMax
        });
        $scope.$broadcast('timer-add-cd-seconds', 10);
    };
    $scope.remove10Seconds = function() {
        if ($scope.time < 0) {
            $scope.time = 0;
        }
        $scope.end_time = moment($scope.end_time).subtract(10, 'seconds').format();
        SocketService.ChangeTime({
            lecture_id: $scope.lecture.lecture_id,
            time: $scope.end_time
        });
    };
    $scope.startQuestion = function() {
        if ($scope.selectedQuestion === 'endLiveLecture') {
            if (window.confirm('Are you sure you want to end the live lecture?')) {
                SocketService.RetireLecture();
            }
            return;
        }
        $scope.labels = [];
        setChoices();
        setColors($scope.choices.length);
        $scope.timerEnabled = true;
        $scope.$broadcast('timer-set-countdown-seconds', $scope.time);
        $scope.end_time = moment().add($scope.time, 'seconds').format();
        SocketService.StartQuestion({
            lecture_id: $scope.lecture.lecture_id,
            question_id: $scope.selectedQuestion,
            max_time: $scope.timeMax,
            end_time: $scope.end_time
        });
        $scope.$broadcast('timer-start');
    };

    $scope.$on('timer-tick', function(event, data) {
        $scope.time = moment($scope.end_time).diff(moment(), 'seconds');
        if ($scope.time <= 0) {
            $scope.$broadcast('timer-stop');
            $scope.selectedQuestion = "";
            $scope.time = 60;
            $scope.timeMax = 60;
            $scope.timerEnabled = false;
            $scope.end_time = 0;
            SocketService.EndQuestion();
        } else {
            $scope.timerEnabled = true;
        }
    });

    $scope.questionSelected = function() {
        if ($scope.selectedQuestion === 'endLiveLecture') {
            clearQuestion();
            $scope.questionBtnTitle = 'End Live Lecture';
            $scope.title = ' ';
            return;
        }
        $scope.questionBtnTitle = 'Start Question';
        clearQuestion();
        RESTService.GetQuestionDetails($scope.selectedQuestion, function(info) {
            if (!info.success) {
                ngNotify.set("Failed to fetch question details", 'error');
                return;
            }
            $scope.choices = info.choices;
            $scope.title = info.title;
            $scope.body = info.body;
            $scope.tags = info.tags;
        });
    };

    function clearQuestion() {
        $scope.title = '';
        $scope.body = '';
        $scope.tags = [];
        $scope.data = [];
        $scope.choices = [];
    }

    function setChoices() {
        $scope.data = [];
        var newData = [];
        for (var i in $scope.choices) {
            var correct = $scope.choices[i].answer ? " ✓" : " ✘";
            $scope.labels.push((parseInt(i) + 1).toString() + correct);
            newData.push(0);
        }
        $scope.data.push(newData);
    }

    function setColors(num) {
        var colors = Please.make_color({
            colors_returned: num,
            format: 'rgb'
        });
        var back = [];
        var border = [];
        colors.forEach(function(color) {
            back.push('rgba(' + color.r + ',' + color.g + ',' + color.b + ', 0.2)');
            border.push('rgba(' + color.r + ',' + color.g + ',' + color.b + ', 1)');
        });
        $scope.datasetOverride = [{
            backgroundColor: back,
            borderColor: border,
            borderWidth: 2
        }];
    }
});
