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

app.controller('Admin.Keys.Controller', function($scope, $localStorage, $state, RESTService, NgTableParams, Notification) {
    $scope.keyLoading = false;
    $scope.generatedKey = null;

    var cnts = [];

    if ($localStorage.keys.length > 5) {
        cnts = [5, 10, 15];
    }

    $scope.tableParams = new NgTableParams({
        count: 10
    }, {
        counts: cnts,
        dataset: $localStorage.keys
    });

    $scope.getInstructorKey = function() {
        $scope.keyLoading = true;
        RESTService.GenerateInstructorKey(postGetKey);
    };

    $scope.copySuccess = function(name) {
        Notification.success({
            message: "Instructor key copied to clipboard",
            delay: 4000,
            positionX: 'center',
            positionY: 'top'
        });
    };

    function postGetKey(info) {
        if (!failed(info)) {
            $scope.generatedKey = info.key;
            $scope.keyLoading = false;
            $scope.tableParams.settings().dataset = $localStorage.keys;
            $scope.tableParams.reload();
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
