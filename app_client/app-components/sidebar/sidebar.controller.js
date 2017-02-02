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

app.controller('Sidebar.Controller', function($scope, $element, $localStorage) {

        $scope.classExpand = false;
        $scope.photo = $localStorage.photo;

        $scope.courseClick = function(index) {
            $scope.$storage.selectedCourse = index;
        };
    }
);
