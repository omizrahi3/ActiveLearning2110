/* jshint node: true */

//************************************************************
//  create_course.controller.js                             //
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

app.controller('Create.Course.Controller', function($scope, $element, $state, RESTService) {

    $scope.loading = false;
    $scope.error = null;
    $scope.onlyNumbers = /^\d+$/;

    $scope.course = {
        prefix: 0,
        days: 0,
        sections: [],
        number: "",
        semester_pre: 0
    };

    $scope.semeseter_pre = [{
        id: 0,
        name: "SPR"
    }, {
        id: 1,
        name: "SUM"
    }, {
        id: 2,
        name: "FAL"
    }];

    $scope.prefixes = [{
        id: 0,
        name: "CS"
    }, {
        id: 1,
        name: "CE"
    }, {
        id: 2,
        name: "CM"
    }, {
        id: 3,
        name: "ME"
    }, {
        id: 4,
        name: "MA"
    }];

    $scope.days = [{
        id: 0,
        name: "MWF",
        daysArr: ["mon", "wed", "fri"]
    }, {
        id: 1,
        name: "TR",
        daysArr: ["tue", "thu"]
    }];

    $scope.create = function() {
        $scope.loading = true;
        var sections = [];
        for (var item in $scope.course.sections) {
            sections.push({name: $scope.course.sections[item].text});
        }
        var data = {
            "title": $scope.prefixes[$scope.course.prefix].name + " " + $scope.course.number,
            "sections": sections,
            "course_schedule": {
                "semester": $scope.semeseter_pre[$scope.course.semester_pre].name,
                "days": $scope.days[$scope.course.days].daysArr,
                "time": $scope.course.time
            }
        };
        console.log(data);
        RESTService.CreateCourse(data, finishCreateCourse);
    };

    function finishCreateCourse(info) {
        if (!info.success) {
            $scope.error = info.message.message;
            $scope.loading = false;
            return;
        }
        $scope.loading = false;
        $element.modal('hide');
    }
});

app.directive('numbersOnly', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9-]/g, '');
                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});
