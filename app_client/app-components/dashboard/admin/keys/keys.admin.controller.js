/* jshint node: true */

//************************************************************
//  keys.admin.controller.js                                //
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

app.controller('Admin.Keys.Controller', function($scope, $localStorage, $state, RESTService) {
    $scope.sortType = 'firstname';
    $scope.sortReverse = false;
    $scope.keyLoading = false;

    $scope.getInstructorKey = function() {
        $scope.keyLoading = true;
        RESTService.GenerateInstructorKey(postGetKey);
    };

    function postGetKey(info) {
        if (!failed(info)) {
            $scope.generatedKey = info.key;
            $scope.keyLoading = false;
        }
    }

    function failed(info) {
        if (!info.success) {
            $scope.keyLoading = false;
            $scope.error = info.message;
            return true;
        } else {
            return false;
        }
    }

});
