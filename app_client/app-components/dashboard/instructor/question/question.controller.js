/* jshint node: true */

//************************************************************
//  course.student.controller.js                            //
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

app.controller('Instructor.Question.Controller', function($scope, $state, $rootScope) {

    $scope.state = 'edit';

    $scope.edit = function() {
        $scope.state = 'cancel';
        $scope.editor.start();
    };

    $scope.save = function() {
        $scope.state = 'edit';
        $scope.editor.stop(true);
    };

    $scope.cancel = function() {
        $scope.state = 'edit';
        $scope.editor.stop(false);
    };

    $rootScope.$on('$stateChangeStart', function() {
        if ($scope.editor.isEditing()) {
            $scope.editor.stop(false);
        }
    });
});
