/* jshint node: true */

//************************************************************
//  sidebar.controller.js                                   //
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

app.controller('Navbar.Controller', function($scope, $element, AuthenticationService, UserService) {

    $scope.logout = function() {
        AuthenticationService.Logout();
    };

    $scope.profile = function() {
        UserService.ShowProfile();
    };
});
