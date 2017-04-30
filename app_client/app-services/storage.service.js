/* jshint node: true */

//************************************************************
//  rest.service.js                                         //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 01/12/17.                   //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  08Feb17     J. Carter  Initial Design                   //
//************************************************************
var app = angular.module('app');

app.factory('UserStorage', function($localStorage, $rootScope) {

    var service = {};

    user = {
        _id: '',
        username: '',
        firstname: '',
        lastname: '',
        photo: '',
        role: 'student',
        courses: [],
        classExpand: false,
        LoggedIn: false,
        jwt_token: null,
        users: [],
        keys: [],
        notifications: {
            count: 0,
            data: []
        }
    };

    $localStorage.$default(user);

    service.UpdateUserInfo = function(data) {
        for (var key in data) {
            $localStorage[key] = data[key];
        }
    };

    service.UpdateSingleUserRole = function(username, role) {
        for (var key in $localStorage.users) {
            if ($localStorage.users[key].username === username) {
                $localStorage.users[key].role = role;
            }
        }
    };

    service.UpdateSingleUserDeact = function(username, value) {
        for (var key in $localStorage.users) {
            if ($localStorage.users[key].username === username) {
                $localStorage.users[key].deactivated = value;
            }
        }
    };

    service.UpdateSingleCourse = function(course) {
        for (var key in $localStorage.courses) {
            if ($localStorage.courses[key]._id === course._id) {
                $localStorage.courses[key] = course;
            }
        }
    };

    service.UpdateSingleLecture = function(course_id, lecture) {
        var course_key = null;
        for (var key in $localStorage.courses) {
            if ($localStorage.courses[key]._id === course_id) {
                course_key = key;
                break;
            }
        }
        for (key in $localStorage.courses[course_key].lectures) {
            var curr = $localStorage.courses[course_key].lectures[key];
            if (curr._id === lecture._id) {
                $localStorage.courses[course_key].lectures[key] = lecture;
            }
        }
        $rootScope.$emit('coursesUpdated');
    };

    service.LectureLiveUpdate = function(lecture_list) {
        for (var i in $localStorage.courses) {
            for (var j in $localStorage.courses[i].lectures) {
                var curr_id = $localStorage.courses[i].lectures[j]._id;
                if (lecture_list.indexOf(curr_id) > -1) {
                    $localStorage.courses[i].lectures[j].live = true;
                } else {
                    $localStorage.courses[i].lectures[j].live = false;
                }
            }
        }
        $rootScope.$emit('coursesUpdated');
    };

    service.UpdateCourseLectures = function(course_id, lectures) {
        for (var key in $localStorage.courses) {
            if ($localStorage.courses[key]._id === course_id) {
                $localStorage.courses[key].lectures = lectures;
            }
        }
        $rootScope.$emit('coursesUpdated');
    };

    service.GetSectionStudents = function(course_id, section_key) {
        var course_key = null;
        for (var key in $localStorage.courses) {
            if ($localStorage.courses[key]._id === course_id) {
                course_key = key;
                break;
            }
        }
        for (key in $localStorage.courses[course_key].sections) {
            var curr = $localStorage.courses[course_key].sections[key];
            if (curr._id === section_key) {
                return $localStorage.courses[course_key].sections[key].students;
            }
        }
    };

    service.FindSectionStudents = function(course, id) {
        for (var key in course.sections) {
            if (course.sections[key]._id === id) {
                return course.sections[key].students;
            }
        }
    };

    service.Clear = function() {
        $localStorage.$reset(user);
    };

    return service;

});
