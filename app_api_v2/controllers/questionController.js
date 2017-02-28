/* jshint node: true */

//************************************************************
//  questionController.js                                   //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Amy Zhuang on 02/05/17.                      //
//  Copyright © 2017 Amy Zhuang. All rights reserved.       //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  02Feb5      A. Zhuang   Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var User  = require('./../models/userModel');
var Question = require('./../models/questionModel');

var roles =   {
                  ADMIN       : 'admin',
                  INSTRUCTOR  : 'instructor',
                  STUDENT     : 'student',
              };

var getAll = function (req, res)
{
    console.log('questionController getAll');
    Question.find(function(err, questions)
    {
        if (err) 
        {
            return res.status(500).json(
                {
                    success: false,
                    message: 'Internal Error'
                }
            );
        }
        else
        {
            return res.status(200).json(
                {
                    success : true,
                    questions : questions,
                    message : "Success on getAll" 
                }
            );
        }
    });
}

var savedQuestionToDB = function (req, res)
{
    console.log('questionController savedQuestionToDB');

    User.findById(req.decodedToken.sub, function(err, user)
    {
        var contributor = 
        {
            contributor_id      : user._id.toString(),
            username            : user.username,
            firstname           : user.firstname,
            lastname            : user.lastname
        };

        var newQuestion = new Question(
            {
                contributor         : contributor,
                tags                : req.body.tags,
                problem_statement   : req.body.problem_statement,
                answer_choices      : req.body.answer_choices,
                answer              : req.body.answer
            }
        );

        newQuestion.save(function(err, savedQuestion)
        {
            if (err)
            {
                var errorMessage = 'Internal Error'
                if (err.code == '11000')
                {
                    errorMessage = 'Question failed to save'
                }
                return res.status(500).json(
                    {
                        success: false,
                        message: errorMessage
                    }
                );
            }
            else
            {
                return res.status(201).json(
                    {
                        success: true,
                        message: 'Question successfully added',
                        jwt_token : req.token,
                        question: savedQuestion

                    }
                );
            }
        });
    });
}


var deleteQuestion = function (req, res)
{
    console.log('questionController deleteQuestion');

    Question.findById(req.params.QUESTIONID, function(err, question)
    {
        if (err || !question)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Question Not Found'
                }
            );
        }
        else
        {
            
            if (req.decodedToken.sub !== question.contributor.contributor_id)
            {
                return res.status(401).json(
                    {
                        success: false,
                        message: 'User not Authorized to delete question'
                    }
                );
            }
            else
            {
                question.remove(function (err)
                {
                    if (err)
                    {
                        return res.status(401).json(
                            {
                                success: false,
                                message: 'Questions Failed to Deleted'
                            }
                        );
                    }
                    else
                    {
                        return res.status(200).json(
                            {
                                success: true,
                                jwt_token : req.token,
                                message: 'Question Deleted'
                            }
                        );
                    }
                });
            }
        }
    });
};

var addTag = function (req, res)
{
    console.log('questionController addTag');

    Question.findById(req.params.QUESTIONID, function(err, question)
    {
        if (err || !question)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Question Not Found'
                }    
            );
        }
        else
        {
            if (req.decodedToken.sub !== question.contributor.contributor_id)
            {
                return res.status(401).json(
                    {
                        success: false,
                        message: 'User not Authorized to delete question'
                    }
                );
            }
            else
            {
                console.log(req.body.new_tag);
                if (req.body.new_tag)
                {
                    console.log("ready to push to array");
                    question.tags.push(req.body.new_tag);
                    question.save(function(err, updated_question)
                    {
                        if (err)
                        {
                            return res.status(401).json(
                                {
                                    success: false,
                                    message: 'Add Tag Failed'
                                }
                            );
                        }
                        else
                        {
                            return res.status(200).json(
                                {
                                    success : true,
                                    message : 'Tag Added',
                                    question: updated_question
                                }
                            );
                        }
                    });
                }
            }
        }
    });
}

var deleteTag = function (req, res)
{
    console.log('questionController deleteTag');

    Question.findById(req.params.QUESTIONID, function(err, question)
    {
        if (err || !question)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Question Not Found'
                }    
            );
        }
        else
        {
            if (req.decodedToken.sub !== question.contributor.contributor_id)
            {
                return res.status(401).json(
                    {
                        success: false,
                        message: 'User not Authorized to delete question'
                    }
                );
            }
            else
            {
                if (req.body.delete_tag)
                {
                    Question.update(
                        {"_id": req.params.QUESTIONID}, 
                        {$pull: {"tags": req.body.delete_tag}}, function(err, data)
                        {
                            if (err || !data || data.nModified === 0)
                            {
                                return res.status(400).json(
                                {
                                    success: false,
                                    message: "Cannot Delete Tag"
                                });
                            }
                            else
                            {
                                return res.status(200).json(
                                {
                                    success: true,
                                    jwt_token: req.token,
                                    message: "Tag Deleted",
                                    data : data
                                });
                            }   
                        }
                    );      
                }
            }
        }
    });
}

var editProblemStatement = function (req, res)
{
    console.log('questionController editProblemStatement');

    Question.findById(req.params.QUESTIONID, function(err, question)
    {
        if (err || !question)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Question Not Found'
                }    
            );
        }
        else
        {
            if (req.decodedToken.sub !== question.contributor.contributor_id)
            {
                return res.status(401).json(
                    {
                        success: false,
                        message: 'User not Authorized to delete question'
                    }
                );
            }
            else
            {
                if (req.body.new_problem_statement)
                {
                    question.problem_statement = req.body.new_problem_statement;
                    question.save(function(err, updated_question)
                    {
                        if (err)
                        {
                            return res.status(401).json(
                                {
                                    success: false,
                                    message: 'Problem Statement Failed to Update'
                                }
                            );
                        }
                        else
                        {
                            return res.status(200).json(
                                {
                                    success : true,
                                    message : 'Problem Statement Updated',
                                    question: updated_question
                                }
                            );
                        }
                    });
                }
            }
        }
    });
}

var addAnswerChoice = function (req, res)
{
    console.log('questionController addAnswerChoice');

    Question.findById(req.params.QUESTIONID, function(err, question)
    {
        if (err || !question)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Question Not Found'
                }    
            );
        }
        else
        {
            if (req.decodedToken.sub !== question.contributor.contributor_id)
            {
                return res.status(401).json(
                    {
                        success: false,
                        message: 'User not Authorized to delete question'
                    }
                );
            }
            else
            {
                if (req.body.new_answer_choice)
                {
                    question.answer_choices.push(req.body.new_answer_choice);
                    question.save(function(err, updated_question)
                    {
                        if (err)
                        {
                            return res.status(401).json(
                                {
                                    success: false,
                                    message: 'Unable to Add Answer Choice'
                                }
                            );
                        }
                        else
                        {
                            return res.status(200).json(
                                {
                                    success : true,
                                    message : 'Answer Choice Added',
                                    question: updated_question
                                }
                            );
                        }
                    });
                }
            }
        }
    });
}

var deleteAnswerChoice = function (req, res)
{
    console.log('questionController deleteAnswerChoice');

    Question.findById(req.params.QUESTIONID, function(err, question)
    {
        if (err || !question)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Question Not Found'
                }    
            );
        }
        else
        {
            if (req.decodedToken.sub !== question.contributor.contributor_id)
            {
                return res.status(401).json(
                    {
                        success: false,
                        message: 'User not Authorized to delete question'
                    }
                );
            }
            else
            {
                if (req.body.delete_answer_choice)
                {
                    Question.update(
                        {"_id": req.params.QUESTIONID}, 
                        {$pull: {"answer_choices": req.body.delete_answer_choice}}, function(err, data)
                        {
                            if (err || !data || data.nModified === 0)
                            {
                                return res.status(400).json(
                                {
                                    success: false,
                                    message: "Cannot Delete Answer Choice"
                                });
                            }
                            else
                            {r
                                return res.status(200).json(
                                {
                                    success: true,
                                    jwt_token: req.token,
                                    message: "Answer Choice Deleted",
                                    data : data
                                });
                            }   
                        }
                    );      
                }
            }
        }
    });
}

var editAnswerChoice = function (req, res)
{
    console.log('questionController editAnswerChoice');

    Question.findById(req.params.QUESTIONID, function(err, question)
    {
        if (err || !question)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Question Not Found'
                }    
            );
        }
        else
        {
            if (req.decodedToken.sub !== question.contributor.contributor_id)
            {
                return res.status(401).json(
                    {
                        success: false,
                        message: 'User not Authorized to delete question'
                    }
                );
            }
            else
            {
                if (req.body.edit_answer_choice)
                {
                    if (req.body.new_answer_choice)
                    {
                        console.log(question);
                        console.log(question.answer_choices.indexOf("a"));
                        var answerChoiceIndex = question.answer_choices.indexOf("a");
                        console.log(answerChoiceIndex);
                        question.answer_choices[answerChoiceIndex] = req.body.new_answer_choice;  


                        question.save(function(err, updated_question)
                        {
                            if (err)
                            {
                                return res.status(401).json(
                                    {
                                        success: false,
                                        message: 'Unable to Edit Answer Choice'
                                    }
                                );
                            }
                            else
                            {
                                return res.status(200).json(
                                    {
                                        success : true,
                                        message : 'Answer Choice Updated',
                                        question: updated_question
                                    }
                                );
                            }
                        });
                    }
                }
            }
        }
    });
}

var editAnswer = function (req, res)
{
    console.log('questionController editAnswer');

    Question.findById(req.params.QUESTIONID, function(err, question)
    {
        if (err || !question)
        {
            return res.status(404).json(
                {
                    success: false,
                    message: 'Question Not Found'
                }    
            );
        }
        else
        {
            if (req.decodedToken.sub !== question.contributor.contributor_id)
            {
                return res.status(401).json(
                    {
                        success: false,
                        message: 'User not Authorized to delete question'
                    }
                );
            }
            else
            {
                if (req.body.new_answer)
                {
                    question.answer = req.body.new_answer;
                    question.save(function(err, updated_question)
                    {
                        if (err)
                        {
                            return res.status(401).json(
                                {
                                    success: false,
                                    message: 'Answer Failed to Update'
                                }
                            );
                        }
                        else
                        {
                            return res.status(200).json(
                                {
                                    success : true,
                                    message : 'Answer Updated',
                                    question: updated_question
                                }
                            );
                        }
                    });
                }
            }
        }
    });
}

module.exports =
{
    getAll              : getAll,
    savedQuestionToDB   : savedQuestionToDB,
    deleteQuestion      : deleteQuestion,
    addTag              : addTag,
    deleteTag           : deleteTag,
    editProblemStatement: editProblemStatement,
    addAnswerChoice     : addAnswerChoice,
    deleteAnswerChoice  : deleteAnswerChoice,
    editAnswerChoice    : editAnswerChoice,
    editAnswer          : editAnswer
};
