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
        'ngStorage',
        'angularModalService',
        'angular-jwt',
        'oc.lazyLoad',
        'moment-picker',
        'ngTagsInput',
        'restangular'
    ]);

app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $ocLazyLoadProvider) {

    $ocLazyLoadProvider.config({
        'debug': true, // For debugging 'true/false'
        'events': true, // For Event 'true/false'
        'modules': [{ // Set modules initially
            name: 'navbar', // State1 module
            files: ['app-components/navbar/navbar.controller.js']
        }, {
            name: 'sidebar', // State2 module
            files: ['app-components/sidebar/sidebar.controller.js']
        }, {
            name: 'student.dashboard',
            files: ['app-components/dashboard/student/dashboard.student.controller.js']
        }, {
            name: 'instructor.dashboard',
            files: ['app-components/dashboard/instructor/dashboard.instructor.controller.js']
        }, {
            name: 'admin.dashboard',
            files: ['app-components/dashboard/admin/dashboard.admin.controller.js']
        }, {
            name: 'admin.keys',
            files: ['app-components/dashboard/admin/keys/keys.admin.controller.js']
        }, {
            name: 'instructor.course',
            files: ['app-components/dashboard/instructor/course/course.instructor.controller.js']
        }, {
            name: 'student.course',
            files: ['app-components/dashboard/student/course/course.student.controller.js']
        }, {
            name: 'services',
            files: ['app-services/storage.service.js', 'app-services/user.service.js', 'app-services/rest.service.js']
        }]
    });

    // app state and individual views
    $stateProvider
        .state('main', {
            url: 'main',
            abstract: true,
            resolve: {
                loadServices: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load('services'); // Resolve promise and load before view
                }]
            },
            views: {
                'navbar': {
                    templateUrl: 'app-components/navbar/navbar.view.html',
                    controller: 'Navbar.Controller',
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('navbar'); // Resolve promise and load before view
                        }]
                    }
                },
                'sidebar': {
                    templateUrl: '/app-components/sidebar/sidebar.view.html',
                    controller: 'Sidebar.Controller',
                    resolve: {
                        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('sidebar'); // Resolve promise and load before view
                        }]
                    }
                },
                'dashboard': {
                    templateUrl: '/app-components/dashboard/container.view.html'
                }
            }
        })

        .state('main.student', {
            url: '/student',
            templateUrl: 'app-components/dashboard/student/dashboard.student.view.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load('student.dashboard'); // Resolve promise and load before view
                }]
            }
        })

        .state('main.student_course', {
            url: '/student/course',
            templateUrl: 'app-components/dashboard/student/course/course.student.view.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load('student.course'); // Resolve promise and load before view
                }]
            }
        })

        .state('main.instructor', {
            url: '/instructor',
            templateUrl: 'app-components/dashboard/instructor/dashboard.instructor.view.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load('instructor.dashboard'); // Resolve promise and load before view
                }]
            }
        })

        .state('main.instructor_course', {
            url: '/instructor/course',
            templateUrl: 'app-components/dashboard/instructor/course/course.instructor.view.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load('instructor.course'); // Resolve promise and load before view
                }]
            }
        })

        .state('main.admin', {
            url: '/admin',
            templateUrl: 'app-components/dashboard/admin/dashboard.admin.view.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load('admin.dashboard'); // Resolve promise and load before view
                }]
            }
        })

        .state('main.admin_keys', {
            url: '/admin/keys',
            templateUrl: 'app-components/dashboard/admin/keys/keys.admin.view.html',
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load('admin.keys'); // Resolve promise and load before view
                }]
            }
        });
});

app.controller('Main.Controller', function($scope, $state, $localStorage, $injector, $ocLazyLoad) {

    $scope.$storage = $localStorage;

    if (!$scope.$storage.hideSidebar) {
        $scope.$storage.hideSidebar = false;
    }

    $ocLazyLoad.load('services').then(function() {
        var UserStorage = $injector.get('UserStorage');
        var RESTService = $injector.get('RESTService');
        var UserService = $injector.get('UserService');

        if (!UserStorage.LoggedIn()) {
            RESTService.Logout();
            UserService.ShowLogin();
        } else {
            $state.go('main.' + $localStorage.role);
        }
    });
});
