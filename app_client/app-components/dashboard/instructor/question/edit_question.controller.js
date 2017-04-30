/* jshint node: true */

//************************************************************
//  edit_question.controller.js                             //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 03/18/17.                   //
//  Copyright © 2016 Jeremy Carter. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  18Mar17     J. Carter  Initial Design                   //
//                                                          //
//************************************************************

var app = angular.module('app');

app.controller('Instructor.Edit.Question.Controller', function($scope, $state, $localStorage, RESTService, UserService, ngNotify, NgTableParams) {

    $scope.questions = null;

    $scope.tableParams = new NgTableParams({
        count: 6,
        sorting: {
            copied: "asc"
        }
    }, {
        counts: [5, 10, 15],
        dataset: $scope.questions
    });

    getAllQuestions();

    $scope.viewQuestion = function(selected_question) {
        RESTService.GetQuestionDetails(selected_question._id, function(info) {
            if (!info.success) {
                ngNotify.set('Could not fetch question details', 'error');
                return;
            }
            UserService.ShowQuestionPreview(info);
        });
    };

    $scope.deleteQuestion = function(selected_question) {
        RESTService.DeleteQuestion(selected_question._id, function(info) {
            if (!info.success) {
                ngNotify.set('Failed to delete question from database', 'error');
                return;
            }
            getAllQuestions();
        });
    };

    $scope.editQuestion = function(selected_question) {
        RESTService.GetQuestionDetails(selected_question._id, function(info) {
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
    function getAllQuestions() {
        RESTService.GetAllQuestions(function(info) {
            if (!info.success) {
                ngNotify.set('Could not fetch questions', 'error');
                return;
            }
            $scope.questions = info.questions;
            $scope.tableParams.settings().dataset = info.questions;
            $scope.tableParams.reload();
        });
    }
});
