/* jshint node: true */

//************************************************************
//  sidebar.controller.js                                   //
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

app.controller('Student.Dashboard.Controller', function($scope, $state, $localStorage, UserService) {

    $scope.joinCourse = function() {
        UserService.ShowJoinCourse();
    };

    $scope.cardClick = function(index) {
        $scope.$storage.selectedCourse = index;
        $state.go('main.' + $localStorage.role + '_course');
    };

});
