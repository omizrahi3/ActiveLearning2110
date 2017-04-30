/* jshint node: true */

//************************************************************
//  add_students.controller.js                              //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 02/11/17.                   //
//  Copyright © 2016 Jeremy Carter. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  11Feb17     J. Carter  Initial Design                   //
//                                                          //
//************************************************************

var app = angular.module('app');

app.controller('Manage.Students.Controller', function($scope, $localStorage, $timeout, $stateParams, $rootScope, RESTService, UserStorage, NgTableParams, Papa, ngNotify) {

    $rootScope.$stateParams = $stateParams;
    $scope.selectedCSV = null;

    var sidx = $stateParams.selectedSection.index;
    var section = $stateParams.selectedSection.section;
    var cidx = $stateParams.selectedCourse;
    var keyArray = ['Name', 'User ID', 'Email Address', 'Role'];
    $scope.changes = {};
    $scope.loading = false;

    $scope.student_tableParams = new NgTableParams({
        count: 10,
        sorting: {
            username: "asc"
        }
    }, {
        counts: [],
        dataset: []
    });

    $scope.upload_tableParams = new NgTableParams({
        count: 10,
        sorting: {
            username: "asc"
        }
    }, {
        counts: [],
        dataset: []
    });

    updateStudentTable();

    $scope.submit_newStudents = function() {
        $scope.loading = true;
        students = [];
        clearChanges();
        for (var key in $scope.upload_tableParams.settings().dataset) {
            var info = {
                username: $scope.upload_tableParams.settings().dataset[key].username,
                firstname: $scope.upload_tableParams.settings().dataset[key].firstname,
                lastname: $scope.upload_tableParams.settings().dataset[key].lastname
            };
            students.push(info);
        }
        RESTService.AddStudents({
            course_id: $localStorage.courses[cidx]._id,
            section_id: section._id,
            data: students
        }, newStudentFinish);
    };

    $scope.deleteStudent = function(student) {
        $scope.loading = true;
        RESTService.DeleteStudent({
            course_id: $localStorage.courses[cidx]._id,
            student_id: student.student_id,
            section_id: section._id
        }, deleteStudentFinish);
    };

    $scope.initUser = function(user) {
        var info = {
            commited: false,
            error: false,
            message: 'Pending'
        };
        $scope.changes[user.username] = info;
    };

    function clearChanges() {
        for (var key in $scope.changes) {
            $scope.changes[key].error = false;
            $scope.changes[key].commited = false;
            $scope.changes[key].message = 'Pending';
        }
    }

    function newStudentFinish(info) {
        $scope.loading = false;
        for (var key in info.students) {
            if (info.students[key].success) {
                $scope.changes[key].commited = true;
            } else {
                $scope.changes[key].error = true;
            }
            $scope.changes[key].message = info.students[key].message;
        }
        $timeout(function() {
            var old_data = $scope.upload_tableParams.settings().dataset;
            var new_data = [];
            for (var skey in old_data) {
                if ($scope.changes[old_data[skey].username].error) {
                    new_data.push($scope.upload_tableParams.settings().dataset[skey]);
                }
            }
            updateUploadTable(new_data);
        }, 5000);
        updateStudentTable();
    }

    function deleteStudentFinish(info) {
        $scope.loading = false;
        if (!info.success) {
            ngNotify.set('Failed to remove student', 'error');
            return;
        }
        updateStudentTable();
    }

    function updateUploadTable(data) {
        if (data === null) {
            ngNotify.set('Invalid CSV File', 'error');
            return;
        }
        var students = data;
        if (students.length > 5) {
            student_cnts = [5, 10, 15];
        } else {
            student_cnts = [];
        }
        $scope.upload_tableParams.settings().counts = student_cnts;
        $scope.upload_tableParams.settings().dataset = data;
        $scope.upload_tableParams.reload();
    }

    function updateStudentTable() {
        var course_id = $localStorage.courses[cidx]._id;
        var section_id = section._id;
        var students = UserStorage.GetSectionStudents(course_id, section_id);
        if (students.length > 5) {
            student_cnts = [5, 10, 15];
        } else {
            student_cnts = [];
        }
        $scope.student_tableParams.settings().counts = student_cnts;
        $scope.student_tableParams.settings().dataset = students;
        $scope.student_tableParams.reload();
    }

    function sameArray(arr1, arr2) {
        return $(arr1).not(arr2).length === 0 && $(arr2).not(arr1).length === 0;
    }

    function sanitizeData(data) {
        var new_data = [];
        for (var key in data) {
            var entry = {};
            var name = data[key].Name.split(',');
            if (data[key].hasOwnProperty('__parsed_extra') || !sameArray(keyArray, Object.keys(data[key]))) {
                return null;
            }
            entry.lastname = name[0].trim();
            entry.firstname = name[1].trim();
            entry.username = data[key]["Email Address"];
            entry.role = data[key].Role;
            entry.userid = data[key]["User ID"];
            new_data.push(entry);
        }
        return new_data;
    }

    function parseError(error, file) {
        ngNotify.set(error.message, 'error');
    }

    $scope.$watch('selectedCSV', function() {
        if ($scope.selectedCSV !== null) {
            Papa.parse($scope.selectedCSV, {
                header: true,
                skipEmptyLines: true,
                error: parseError
            }).then(
                function(result) {
                    updateUploadTable(sanitizeData(result.data));
                }
            );
        }
    });
});
