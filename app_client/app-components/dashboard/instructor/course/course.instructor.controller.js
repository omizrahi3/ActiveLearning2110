/* jshint node: true */

//************************************************************
//  course.instructor.controller.js                         //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 02/03/17.                   //
//  Copyright © 2016 Jeremy Carter. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  11Feb17     J. Carter  Initial Design                   //
//                                                          //
//************************************************************

var app = angular.module('app');

app.controller('Instructor.Course.Controller', function($scope, $state, $localStorage, $stateParams, $rootScope, $window, UserService, NgTableParams, ngNotify, SocketService) {

    $rootScope.$stateParams = $stateParams;
    $scope.course = $localStorage.courses[$stateParams.selectedCourse];
    $scope.course_index = $stateParams.selectedCourse;

    $scope.chart_options = {
        labels: ["Verified", "Pending"],
        colors: ['#2F81FF', '#D1D1D1']
    };

    $scope.copySuccess = function(name) {
        ngNotify.set("Section " + name.toUpperCase() + "'s key copied to clipboard", 'success');
    };


    $scope.status_data = {};

    $scope.status_options = {
        responsive: false,
        maintainAspectRatio: false
    };

    $scope.currentSectionPage = 1;
    $scope.itemsPerPage = 3;

    $scope.updateSectionPage = function(index) {
        $scope.currentSectionPage = index;
    };

    $scope.tableParams = new NgTableParams({
        count: 6,
        sorting: {
            date: "asc"
        }
    }, {
        counts: [],
        dataset: $scope.course.lectures,
        getData: function(params) {
            var orderedData;
            data = $localStorage.courses[$stateParams.selectedCourse].lectures;
            if (params.sorting().date === 'asc') {

                data.sort(function(a, b) {
                    var dateA = new Date(a.schedule.date),
                        dateB = new Date(b.schedule.date);
                    return dateA - dateB;
                });
                orderedData = data;
            } else if (params.sorting().date === 'desc') {

                data.sort(function(a, b) {
                    var dateA = new Date(a.schedule.date),
                        dateB = new Date(b.schedule.date);
                    return dateB - dateA;
                });
                orderedData = data;
            }
            return orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
        }
    });

    $rootScope.$on('coursesUpdated', function() {
        if ($stateParams.selectedCourse !== null && $state.current.name === 'main.instructor_course') {
            $scope.tableParams.settings().dataset = $localStorage.courses[$stateParams.selectedCourse].lectures;
            $scope.tableParams.reload();
        }
    });

    $scope.getPages = function(list, itemsPer) {
        var total = Math.ceil(list.length / itemsPer);
        var arr = [];
        for (var i = 0; i < total; i++) {
            arr.push(i);
        }
        return arr;
    };

    $scope.statusPopulate = function(section) {
        var verified = 0;
        var pending = 0;
        for (var key in section.students) {
            if (section.students[key].status === "complete") {
                verified++;
            } else {
                pending++;
            }
        }
        $scope.status_data[section.name] = [verified, pending];
    };

    $scope.joinAvail = function(date) {
        return date === moment().format("MM/DD/YY") ? true : false;
    };

    $scope.startLecture = function(lecture, index) {
        SocketService.StartLecture({
            username: $localStorage.username,
            user_id: $localStorage._id,
            user_role: $localStorage.role,
            lecture_id: lecture._id,
            course_id: $scope.course._id
        });
        $localStorage.hideSidebar = false;
        $state.go('main.instructor_live_lecture', {
            selectedCourse: $scope.course_index,
            selectedLecture: index
        });
    };

    var w = angular.element($window);
    $scope.$watch(
        function() {
            return $window.innerWidth;
        },
        function(value) {
            $scope.windowWidth = value;
            if (value <= 1542) {
                $scope.itemsPerPage = 2;
            } else if (value > 1542 && value <= 2186) {
                $scope.itemsPerPage = 3;
            } else {
                $scope.itemsPerPage = 4;
            }
        },
        true
    );

    w.on('resize', function() {
        $scope.$apply();
    });
});
