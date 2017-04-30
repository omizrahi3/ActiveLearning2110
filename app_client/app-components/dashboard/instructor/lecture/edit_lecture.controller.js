/* jshint node: true */

//************************************************************
//  edit_lecture.controller.js                              //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 02/27/17.                   //
//  Copyright © 2016 Jeremy Carter. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  27Feb17     J. Carter  Initial Design                   //
//                                                          //
//************************************************************

var app = angular.module('app');

app.controller('Instructor.Edit.Lecture.Controller', function($scope, $localStorage, $state, $stateParams, $rootScope, $http, RESTService, UserService, ngNotify) {

    $scope.addLoading = false;
    $scope.removeLoading = false;
    $scope.questions = null;
    $scope.selectedQuestion = [];
    $scope.selectedQuestionSet = [];

    $rootScope.$stateParams = $stateParams;
    $scope.course = $localStorage.courses[$stateParams.selectedCourse];
    updateLectureInfo();

    RESTService.GetLectureInfo({
        lecture_id: $scope.lecture._id,
        course_id: $scope.course._id
    }, function(info) {
        if (!info.success) {
            ngNotify.set('Could not fetch lecture info', 'error');
            return;
        }
        $scope.lecture = $scope.course.lectures[$stateParams.selectedLecture];
    });

    $scope.options = [{
        title: 'All Questions',
        type: 'all'
    }, {
        title: 'Question Sets',
        type: 'sets'
    }];

    $scope.searchType = $scope.options[0];

    $scope.loadQuestions = function(query) {
        if (query !== '') {
            var tags = getTags(query);
            return $http.get('/api_v2/question?tag=' + tags.join('&tag='), {
                cache: false
            }).then(
                function(response) {
                    var questions = response.data.questions;
                    for (var i in questions) {
                        questions[i].my_id = $localStorage._id;
                    }
                    return questions.filter(function(question) {
                        return new RegExp(tags.join("|")).test(question.tags.toString());
                    });
                },
                function(response) {
                    ngNotify.set('Unable to Search', 'error');
                }
            );
        }
    };

    $scope.loadQuestionSets = function(query) {
        if (query !== '') {
            return $http.get('/api_v2/user/' + $localStorage._id + '/questionsets', {
                cache: false
            }).then(
                function(response) {
                    var sets = response.data.questionsets;
                    return sets.filter(function(set) {
                        return set.title.toLowerCase().indexOf(query.toLowerCase()) != -1;
                    });
                },
                function(response) {
                    ngNotify.set('Unable to Search', 'error');
                }
            );
        }
    };

    function getTags(query) {
        var newQuery = query.toLowerCase();
        return newQuery.split(/[|,]/g).map(function(item) {
            return encodeURIComponent(item.trim());
        });
    }

    $scope.addQuestion = function() {
        $scope.addLoading = true;
        RESTService.AddQuestionToLecture({
            question_id: $scope.selectedQuestion[0]._id,
            lecture_id: $scope.lecture._id,
            course_id: $scope.course._id
        }, finishAddQuestionToLecture);
    };

    $scope.removeQuestion = function(selected_question) {
        $scope.removeLoading = true;
        RESTService.RemoveQuestionFromLecture({
            question_id: selected_question.question_id,
            lecture_id: $scope.lecture._id,
            course_id: $scope.course._id
        }, finishRemoveQuestionFromLecture);
    };

    $scope.viewQuestion = function(selected_question) {
        RESTService.GetQuestionDetails(selected_question.question_id, function(info) {
            if (!info.success) {
                ngNotify.set('Could not fetch question details', 'error');
                return;
            }
            UserService.ShowQuestionPreview(info);
        });
    };

    $scope.editQuestion = function(selected_question) {
        RESTService.GetQuestionDetails(selected_question.question_id, function(info) {
            if (!info.success) {
                ngNotify.set('Could not fetch question details', 'error');
                return;
            }
            info.titleText = selected_question.title;
            info._id = selected_question._id;
            $state.go('main.instructor_question', {
                question: info
            });
        });
    };

    $scope.createQuestionSet = function() {
        RESTService.CreateQuestionSet({
            title: $scope.setName.toLowerCase(),
            lecture_id: $scope.lecture._id
        }, finishCreateQuestionSet);
    };

    $scope.checkSelectedQuestion = function() {
        if ($scope.selectedQuestion.length > 1 || $scope.selectedQuestion[0] === undefined) {
            return true;
        } else if (!$scope.selectedQuestion[0].hasOwnProperty('_id') || $scope.addLoading || $scope.removeLoading) {
            return true;
        } else {
            for (var key in $scope.lecture.questions) {
                if ($scope.lecture.questions[key].question_id === $scope.selectedQuestion[0]._id) {
                    return true;
                }
            }
            return false;
        }
    };

    $scope.checkSelectedQuestionSet = function() {
        if ($scope.selectedQuestionSet.length > 1 || $scope.selectedQuestionSet[0] === undefined) {
            return true;
        } else if (!$scope.selectedQuestionSet[0].hasOwnProperty('_id') || $scope.addLoading || $scope.removeLoading) {
            return true;
        }
        return false;
    };

    $scope.addQuestionSet = function() {
        $scope.addLoading = true;
        RESTService.AddQuestionSetToLecture({
            lecture_id: $scope.lecture._id,
            course_id: $scope.course._id,
            questionset_id: $scope.selectedQuestionSet[0]._id
        }, finishAddQuestionToLecture);
    };

    var beforeSortItems;

    $scope.sortableOptions = {
        start: function() {
            beforeSortItems = $scope.lecture.questions.slice();
        },
        stop: function(e, ui) {
            RESTService.MoveLectureQuestion({
                lecture_id: $scope.lecture._id,
                question_id: $scope.lecture.questions[ui.item.index()].question_id,
                index: ui.item.index()
            }, function(info) {
                if (!info.success) {
                    $scope.lecture.questions = beforeSortItems;
                    ngNotify.set('Error moving question', 'error');
                }
            });
        }
    };

    function updateLectureInfo() {
        $scope.lecture = $scope.course.lectures[$stateParams.selectedLecture];
        $scope.questions = $scope.lecture.questions;
    }

    function finishCreateQuestionSet(info) {
        $scope.saveSet = false;
        if (!info.success) {
            ngNotify.set('Error creating question set', 'error');
            return;
        }
        ngNotify.set('Question set created', 'success');
        $scope.setName = null;
    }

    function finishAddQuestionToLecture(info) {
        $scope.addLoading = false;
        if (!info.success) {
            ngNotify.set('Error adding question to lecture', 'error');
            return;
        }
        updateLectureInfo();
        $scope.selectedQuestion = [];
        $scope.selectedQuestionSet = [];
    }

    function finishRemoveQuestionFromLecture(info) {
        $scope.removeLoading = false;
        if (!info.success) {
            ngNotify.set('Error removing question from lecture', 'error');
            return;
        }
        updateLectureInfo();
    }
});
