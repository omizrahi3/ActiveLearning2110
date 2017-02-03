/* jshint node: true */

//************************************************************
//  app.js                                                  //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 01/11/16.                   //
//  Copyright © 2016 Jeremy Carter. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  11Jan16     J. Carter  Initial Design                   //
//  14Jan16     J. Carter  Implemented local storage for    //
//                          data persistance.               //
//************************************************************

var app = angular
    .module('app', [
        'ui.router',
        'ngMessages',
        'ngStorage',
        'angularModalService',
        'angular-jwt'
    ]);

app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

    // app state and individual views
    $stateProvider
        .state('main', {
            url: '/main',
            views: {
                'navbar': {
                    templateUrl: 'app-components/navbar/navbar.view.html',
                    controller: 'Navbar.Controller',
                },
                'sidebar': {
                    templateUrl: '/app-components/sidebar/sidebar.view.html',
                    controller: 'Sidebar.Controller',
                },
                'dashboard': {
                    templateUrl: '/app-components/dashboard/container.view.html',
                    controller: 'Container.Controller',
                }
            }
        })

        .state('main.dashboard', {
            url: '/dashboard',
            templateUrl: 'app-components/dashboard/dashboard.view.html'
        })

        .state('main.course', {
            url: '/course',
            templateUrl: 'app-components/dashboard/course.view.html'
        });
});

app.controller('Main.Controller', function($scope, $http, $state, $localStorage, $rootScope, AuthenticationService, UserService) {

    // All user info once fetched will be stored in local storage. now any of the other controllers can access user info
    // by using $storage.<field>. Ex: to get the user's e-mail do -> $storage.email

    $scope.$storage = $localStorage;

    if (!$scope.$storage.hideSidebar) {
        $scope.$storage.hideSidebar = false;
    }

    if (!AuthenticationService.LoggedIn()) {
        AuthenticationService.Logout();
        UserService.ShowLogin();
    } else {
        $state.go('main.dashboard');
    }
});
