/* jshint node: true */

//************************************************************
//  navbar.controller.js                                    //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 01/13/17.                   //
//  Copyright © 2016 Jeremy Carter. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  13Jan17     J. Carter  Initial Design                   //
//                                                          //
//************************************************************

var app = angular.module('app');

app.controller('Navbar.Controller', function($scope, $localStorage, $state, $stateParams, $rootScope, RESTService, UserService) {

    $scope.title = 'Active Learning 2110';
    $rootScope.$stateParams = $stateParams;

    $scope.logout = function() {
        RESTService.Logout();
    };

    $scope.profile = function() {
        UserService.ShowProfile();
    };

    $scope.$watch(function() {
        return $state.current.url;
    }, function(newVal, oldVal) {
        if (newVal !== undefined) {
            if ($stateParams.selectedCourse !== undefined) {
                $scope.title = $localStorage.courses[$stateParams.selectedCourse].title;
                if ($stateParams.selectedSection !== undefined) {
                    $scope.title = $scope.title + " - " + $stateParams.selectedSection.section.name;
                }
            } else {
                $scope.title = 'Active Learning 2110';
            }
        }
    });
});
