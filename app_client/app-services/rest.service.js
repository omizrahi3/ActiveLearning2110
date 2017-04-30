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

app.factory('RESTService', function($http, $localStorage, $state, $q, Restangular, UserStorage, UserService, SocketService, jwtHelper, ngNotify) {

    var service = {};

    var baseREST = Restangular.all("api_v2");

    Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
        if (response.status === -1) {
            service.Logout();
            ngNotify.set("Failed to connect to server. Server may be down.", 'error');
            return false; // error handled
        }
        return true; // error not handled
    });

    service.LoggedIn = function() {
        if ($localStorage.jwt_token && !jwtHelper.isTokenExpired($localStorage.jwt_token) && $localStorage.LoggedIn) {
            $localStorage.LoggedIn = true;
            Restangular.setDefaultHeaders({
                token: $localStorage.jwt_token
            });
            SocketService.connectToServer();
            return true;
        } else {
            $localStorage.LoggedIn = false;
            return false;
        }
    };

    service.Register = function(info, callback) {
        var signup = null;
        if (info.professor) {
            signup = {
                role: 'instructor'
            };
        }
        baseREST.customPOST(info, "signup", signup).then(
            function(response) {
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.Login = function(info, callback) {
        baseREST.one("authenticate").post("", info).then(
            function(response) {
                Restangular.setDefaultHeaders({
                    token: response.jwt_token
                });
                var data = {
                    username: info.username,
                    _id: response.user_id,
                    jwt_token: response.jwt_token,
                    LoggedIn: true
                };
                var retInfo = genRetInfo(response);
                UserStorage.UpdateUserInfo(data);
                callback(retInfo);
                SocketService.connectToServer();
            },
            function(response) {
                callback(genRetInfo(response));
            });
    };

    service.GetUserInfo = function(callback) {
        baseREST.one("user", $localStorage._id).get().then(
            function(response) {
                UserStorage.UpdateUserInfo(response.user);
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.GetCourseList = function(callback) {
        baseREST.one("user", $localStorage._id).one("courses").get().then(
            function(response) {
                UserStorage.UpdateUserInfo({
                    courses: response.courses
                });
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.GetAllUsers = function(callback) {
        baseREST.one("user").get().then(
            function(response) {
                UserStorage.UpdateUserInfo({
                    users: response.user
                });
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.GetAllKeys = function(callback) {
        baseREST.one("signup").one("registration_key").get().then(
            function(response) {
                UserStorage.UpdateUserInfo({
                    keys: response.keys
                });
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.GenerateInstructorKey = function(callback) {
        baseREST.one("signup").one("instructor_key").post().then(
            function(response) {
                UserStorage.UpdateUserInfo({
                    keys: response.keys
                });
                var retInfo = genRetInfo(response);
                retInfo.key = response.key.key;
                callback(retInfo);
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.UpdateUserInfo = function(info, callback) {
        baseREST.one("user", $localStorage._id).post("", info).then(
            function(response) {
                UserStorage.UpdateUserInfo(response.user);
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.UpdateUserPass = function(info, callback) {
        baseREST.one("user", $localStorage._id).one("password").post("", info).then(
            function(response) {
                console.log(response);
                callback(genRetInfo(response));
            },
            function(response) {
                console.log(response);
                callback(genRetInfo(response));
            }
        );
    };

    service.UpdateUserRole = function(info, callback) {
        baseREST.one("user", info.id).one("role").post("", {
            new_role: info.new_role
        }).then(
            function(response) {
                var retInfo = genRetInfo(response);
                retInfo.key = info.key;
                UserStorage.UpdateSingleUserRole(info.key, response.user.role);
                callback(retInfo);
            },
            function(response) {
                var retInfo = genRetInfo(response);
                retInfo.key = info.key;
                callback(retInfo);
            }
        );
    };

    service.UpdateUserDeactivation = function(info, callback) {
        baseREST.one("user", info.id).one("deactivate").post().then(
            function(response) {
                var retInfo = genRetInfo(response);
                retInfo.key = info.key;
                UserStorage.UpdateSingleUserDeact(info.key, response.user.deactivated);
                callback(retInfo);
            },
            function(response) {
                var retInfo = genRetInfo(response);
                retInfo.key = info.key;
                callback(retInfo);
            }
        );
    };

    service.CreateCourse = function(info, callback) {
        baseREST.one("course").post("", info).then(
            function(response) {
                UserStorage.UpdateUserInfo({
                    courses: response.courses
                });
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.JoinCourse = function(info, callback) {
        baseREST.one("course").one("students").post("", info).then(
            function(response) {
                UserStorage.UpdateUserInfo({
                    courses: response.courses
                });
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.CreateLecture = function(info, callback) {
        baseREST.one("course", info.course_id).one("lectures").post("", info.data).then(
            function(response) {
                console.log(response);
                UserStorage.UpdateCourseLectures(info.course_id, response.lectures);
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    function getAddStudentPromise(info) {
        var deferred = $q.defer();
        baseREST.one("course", info.course_id).one("sections", info.section_id)
            .customPOST(info.student, "students").then(
                function(response) {
                    deferred.resolve(response);
                },
                function(response) {
                    deferred.resolve(response.data);
                }
            );
        return deferred.promise;
    }

    service.AddStudents = function(info, callback) {
        var calls = [];
        var retInfo = {
            course: {
                success: false,
                message: null
            },
            students: {}
        };
        for (var key in info.data) {
            calls.push(getAddStudentPromise({
                course_id: info.course_id,
                section_id: info.section_id,
                student: info.data[key]
            }));
        }
        $q.all(calls).then(
            function(values) {
                for (var key in values) {
                    retInfo.students[values[key].student_username] = {
                        success: values[key].success,
                        message: values[key].message
                    };
                }
                service.GetCourseInfo(info.course_id, function(reply) {
                    retInfo.course.success = reply.success;
                    retInfo.course.message = reply.message;
                    callback(retInfo);
                });
            }
        );
    };

    service.GetCourseInfo = function(id, callback) {
        baseREST.one("course", id).get().then(
            function(response) {
                UserStorage.UpdateSingleCourse(response.courses[0]);
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.DeleteStudent = function(info, callback) {
        baseREST.one("course", info.course_id)
            .one("sections", info.section_id)
            .one("students", info.student_id).remove().then(
                function(response) {
                    UserStorage.UpdateSingleCourse(response.course);
                    callback(genRetInfo(response));
                },
                function(response) {
                    callback(genRetInfo(response));
                }
            );
    };

    service.CreateQuestion = function(info, callback) {
        baseREST.one("question").post("", info).then(
            function(response) {
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.AddQuestionToLecture = function(info, callback) {
        baseREST.one("lecture", info.lecture_id).one("questions", info.question_id).post().then(
            function(response) {
                UserStorage.UpdateSingleLecture(info.course_id, response.lecture);
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.RemoveQuestionFromLecture = function(info, callback) {
        baseREST.one("lecture", info.lecture_id).one("questions", info.question_id).remove().then(
            function(response) {
                UserStorage.UpdateSingleLecture(info.course_id, response.lecture);
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.CreateQuestionSet = function(info, callback) {
        baseREST.one("lecture", info.lecture_id).one("questionset").post("", {
            title: info.title
        }).then(
            function(response) {
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.AddQuestionSetToLecture = function(info, callback) {
        baseREST.one("lecture", info.lecture_id).one("questionset", info.questionset_id).post().then(
            function(response) {
                UserStorage.UpdateSingleLecture(info.course_id, response.lecture);
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.GetLectureInfo = function(info, callback) {
        baseREST.one("lecture", info.lecture_id).get().then(
            function(response) {
                UserStorage.UpdateSingleLecture(info.course_id, response.lecture);
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.MoveLectureQuestion = function(info, callback) {
        baseREST.one("lecture", info.lecture_id).one("questions", info.question_id).one("reorder").post("", {
            index: info.index
        }).then(
            function(response) {
                callback(genRetInfo(response));
            },
            function(response) {
                console.log(response);
                callback(genRetInfo(response));
            }
        );
    };

    service.GetQuestionDetails = function(question_id, callback) {
        baseREST.one("question", question_id).get().then(
            function(response) {
                var retInfo = genRetInfo(response);
                retInfo.title = response.question.html_title;
                retInfo.body = response.question.html_body;
                retInfo.tags = response.question.tags;
                retInfo.choices = response.question.answer_choices;
                callback(retInfo);
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.GetAllQuestions = function(callback) {
        baseREST.one("user", $localStorage._id).one("questions").get().then(
            function(response) {
                var retInfo = genRetInfo(response);
                retInfo.questions = response.questions;
                callback(retInfo);
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.UpdateQuestion = function(info, callback) {
        baseREST.one("question", info.question_id).post("", info.question).then(
            function(response) {
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.DeleteQuestion = function(question_id, callback) {
        baseREST.one("question", question_id).remove().then(
            function(response) {
                callback(genRetInfo(response));
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.GetLectureResults = function(info, callback) {
        baseREST.one("result", info.lecture_id).get().then(
            function(response) {
                var retInfo = genRetInfo(response);
                retInfo.results = response.results;
                callback(retInfo);
            },
            function(response) {
                callback(genRetInfo(response));
            }
        );
    };

    service.Logout = function() {
        if (service.LoggedIn()) {
            baseREST.one("authenticate").remove();
        }
        UserStorage.Clear();
        Restangular.setDefaultHeaders({
            token: ""
        });
        $state.go('main');
        SocketService.disconnect();
    };

    function genRetInfo(response) {
        if (response.message) {
            return {
                message: response.message,
                success: response.success
            };
        } else {
            return {
                message: response.data.message,
                success: response.data.success
            };
        }
        Restangular.setDefaultHeaders({
            token: response.jwt_token
        });
        UserStorage.UpdateUserInfo({
            jwt_token: response.jwt_token
        });
    }

    return service;

});
