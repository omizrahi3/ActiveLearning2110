/* jshint node: true */

//************************************************************
//  dashboard.admin.controller.js                           //
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

app.controller('Admin.Dashboard.Controller', function($scope, $localStorage, $state, UserService) {

    $scope.loading = false;
    $scope.sortType = 'firstname';
    $scope.sortReverse = false;
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

    $scope.initUser = function(user, index) {
        var info = {
            "role": user.role,
            "deactivated": user.deactivated,
            "id": user._id,
            "commited": false,
            "error": false,
            "index": index,
            "changed_role": false,
            "changed_deactivated": false
        };
        $scope.changes[user.username] = info;
    };

    $scope.commitChanges = function() {
        $scope.loading = true;
        var changed = false;
        for (var key in $scope.changes) {
            var info =  {
                "id": $scope.changes[key].id,
                "key": key,
                "new_role": $scope.changes[key].role
            };
            if ($scope.changes[key].changed_role === true) {
                UserService.UpdateUserRole(info, finishChange);
                changed = true;
            }
            if ($scope.changes[key].changed_deactivated === true) {
                UserService.UpdateUserDeactivation(info, finishChange);
                changed = true;
            }
        }
        if (!changed) {
            $scope.loading = false;
        }
    };

    function finishChange(info) {
        if (!info.result) {
            $scope.changes[info.key].error = true;
            return;
        }
        $scope.changes[info.key].changed = false;
        $scope.changes[info.key].commited = true;
        $scope.changes[info.key].changed_role = false;
        $scope.changes[info.key].changed_deactivated = false;
        $scope.loading = false;
    }
});

app.filter('activation', function() {
    return function(deactivated) {
        if (!deactivated) {
            return 'Deactivate';
        } else {
            return 'Activate';
        }
    };
});
