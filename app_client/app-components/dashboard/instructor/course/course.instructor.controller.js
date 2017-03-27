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

app.controller('Instructor.Course.Controller', function($scope, $localStorage, $stateParams, $rootScope, $window, UserService, NgTableParams, ngNotify) {

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

    $scope.$watch(function() {
        return $localStorage.courses[$stateParams.selectedCourse].lectures;
    }, function(newVal, oldVal) {
        if (newVal !== null && newVal !== undefined) {
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
                verified += 1;
            } else {
                pending += 1;
            }
        }
        $scope.status_data[section.name] = [verified, pending];
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
