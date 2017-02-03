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

app.controller('Container.Controller', function($scope, $element, $localStorage, $state, UserService) {

    $scope.sortType = 'firstname';
    $scope.sortReverse = false;
    $scope.keyLoading = false;
    $scope.searchUsers = '';

    $scope.changes = {};

    $scope.roles = [{
        id: "1",
        name: "instructor"
    }, {
        id: "2",
        name: "student"
    }, {
        id: "3",
        name: "admin"
    }];

    $scope.courseAC = function() {
        UserService.ShowACCourse();
    };

    $scope.cardClick = function(index) {
        $scope.$storage.selectedCourse = index;
        $state.go('main.course');
    };

    $scope.getInstructorKey = function() {
        $scope.keyLoading = true;
        UserService.GenerateInstructorKey(postGetKey);
    };

    function postGetKey(result, status, data) {
        if (!result) {
            $scope.error = data.message;
            $scope.keyLoading = false;
            return;
        }
        $scope.generatedKey = data.key.key;
        $scope.keyLoading = false;
    }
});
