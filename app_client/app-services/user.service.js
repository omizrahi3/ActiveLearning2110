/* jshint node: true */

//************************************************************
//  user.service.js                                         //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 01/12/17.                   //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  12Jan17     J. Carter  Initial Design                   //
//  15Jan17     J. Carter  Moved in ShowLogin & created     //
//                          ShowACCourse                    //
//************************************************************
var app = angular.module('app');

app.factory('UserService', function($state, $localStorage, ModalService) {

    var service = {};

    service.ShowLogin = function() {
        ModalService.showModal({
            templateUrl: '/app-components/modals/login/login.view.html',
            controller: 'Login.Controller'
        }).then(function(modal) {
            modal.element.modal({
                backdrop: 'static',
                keyboard: false
            });
            modal.close.then(function(result) {
                if (result) {
                    $('.modal-backdrop').remove();
                    $state.go('main.' + $localStorage.role);
                }
            });
        });
    };

    service.ShowProfile = function() {
        ModalService.showModal({
            templateUrl: '/app-components/modals/profile/profile.view.html',
            controller: 'Profile.Controller'
        }).then(function(modal) {
            modal.element.modal();
        });
    };

    service.ShowJoinCourse = function() {
        ModalService.showModal({
            templateUrl: '/app-components/modals/join_course/join_course.view.html',
            controller: 'Join.Course.Controller'
        }).then(function(modal) {
            modal.element.modal();
        });
    };

    service.ShowCreateCourse = function() {
        ModalService.showModal({
            templateUrl: '/app-components/modals/create_course/create_course.view.html',
            controller: 'Create.Course.Controller'
        }).then(function(modal) {
            modal.element.modal();
        });
    };

    service.ShowCreateLecture = function() {
        ModalService.showModal({
            templateUrl: '/app-components/modals/create_lecture/create_lecture.view.html',
            controller: 'Create.Lecture.Controller'
        }).then(function(modal) {
            modal.element.modal();
        });
    };

    return service;
});

app.directive("picread", [function() {
    return {
        scope: {
            picread: "="
        },
        link: function(scope, element, attributes) {
            element.on("change", function(changeEvent) {
                var reader = new FileReader();
                reader.onload = function(loadEvent) {
                    scope.$apply(function() {
                        scope.picread = loadEvent.target.result;
                        element.val(null);
                    });
                };
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    };
}]);

app.directive("fileread", [function() {
    return {
        scope: {
            fileread: "="
        },
        link: function(scope, element, attributes) {
            element.on("change", function(changeEvent) {
                scope.$apply(function() {
                    scope.fileread = changeEvent.target.files[0];
                    element.val(null);
                });
            });
        }
    };
}]);

app.directive('ngEditor', function() {

    function link(scope, element, attrs) {

        // Initialise the editor
        scope.editor = new ContentTools.EditorApp.get();
        scope.editor.init('[ng-editor]', 'ng-editor', null, false);

        // Bind a function on editor save
        scope.editor.addEventListener('saved', function(ev) {
            scope.regions = ev.detail().regions;
            // "regions" contains all the html for each editable regions
            // Now, "regions" can be saved and used as needed.
        });
    }
    return {
        link: link
    };
});

app.filter('gradecolor', function() {
    return function(str) {
        if (str < 50) {
            return "#ff6384";
        } else if (str < 70) {
            return "#FFFFBA";
        } else {
            return "#45b7cd";
        }
    };
});

app.filter('days', function() {
    return function(str) {
        return str.includes("mon") ? "MWF" : "TR";
    };
});

app.filter('offset', function() {
    return function(input, start) {
        return input.slice(start);
    };
});
