/* jshint node: true */

//************************************************************
//  sidebar.controller.js                                   //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 01/12/17.                   //
//  Copyright © 2016 Jeremy Carter. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  12Jan17     J. Carter  Initial Design                   //
//                                                          //
//************************************************************

var app = angular.module('app');

app.controller('Sidebar.Controller', function($scope, $state, $stateParams, $rootScope, $localStorage, UserService) {


    $scope.state = null;
    $rootScope.$stateParams = $stateParams;

    $scope.createCourse = function() {
        UserService.ShowCreateCourse();
    };

    $scope.createLecture = function() {
        UserService.ShowCreateLecture();
    };

    $scope.$watch(function() {
        return $state.current.url;
    }, function(newVal, oldVal) {
        if (newVal !== undefined) {
            $scope.state = newVal;
            if ($stateParams.selectedCourse !== undefined) {
                $scope.instructor = $localStorage.courses[$stateParams.selectedCourse].instructor;
                $scope.course = $localStorage.courses[$stateParams.selectedCourse];
            }
        }
    });
});
