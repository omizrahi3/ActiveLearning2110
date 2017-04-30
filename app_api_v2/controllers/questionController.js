/* jshint node: true */
/* jshint esversion: 6 */

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

var User = require('./../models/userModel'),
    Question = require('./../models/questionModel'),
    winston = require('winston');

var checkForNull = function(data) {
    var promise = new Promise(function(resolve, reject) {
        if (!data) {
            var error_message = new Error('Does Not Exist');
            reject(error_message);
        } else {
            resolve(data);
        }
    });
    return promise;
};

var editQuestion = function(req, res) {
    winston.info('questionController: edit question');

    Question.findOneAndUpdate({
            _id: req.params.QUESTIONID,
            instructor_id: req.decodedToken.sub,
            copied: false
        }, {
            title: req.body.title,
            tags: req.body.tags,
            instructor_id: req.decodedToken.sub,
            html_title: req.body.html_title,
            html_body: req.body.html_body,
            answer_choices: req.body.answer_choices,
            copied: false
        }, {
            new: true
        })
        .exec()
        .then(checkForNull)
        .then(function(question) {
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                message: 'Question Updated',
                question: question
            });
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: "Cannot Edit Question"
            });
        });
};

var copyQuestion = function(req, res) {
    winston.info('questionController: copy question');

    Question.findById(req.params.QUESTIONID)
        .exec()
        .then(checkForNull)
        .then(function(question) {
            return new Promise((resolve, reject) => {
                if (question.instructor_id === req.decodedToken.sub) {
                    var error_message = new Error('Cannot Copy Own Question');
                    reject(error_message);
                }
                resolve(question);
            });
        })
        .then(function(question) {
            var newQuestion = new Question({
                title: question.title,
                tags: question.tags,
                instructor_id: req.decodedToken.sub,
                html_title: question.html_title,
                html_body: question.html_body,
                answer_choices: question.answer_choices,
                copied: true
            });
            return newQuestion.save();
        })
        .then(function(question) {
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                message: 'Question Copied',
                question: question
            });
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        });
};

var deleteQuestion = function(req, res) {
    winston.info('questionController: delete question');

    Question.remove({
            _id: req.params.QUESTIONID,
            instructor_id: req.decodedToken.sub
        })
        .exec()
        .then(function(data) {
            return new Promise((resolve, reject) => {
                if (data.result.n === 0) {
                    var error_message = new Error('Cannot Delete Question');
                    reject(error_message);
                }
                resolve(data);
            });
        })
        .then(function(data) {
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                message: 'Question Deleted'
            });
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        });
};

var getAllQuestions = function(req, res) {
    winston.info('questionController: get all questions');

    if (req.query.tag !== undefined) {
        Question.find({
                tags: {
                    $all: req.query.tag
                },
                copied: false
            }, {
                "html_title": 0,
                "html_body": 0,
                "__v": 0,
                "answer_choices": 0
            })
            .exec()
            .then(function(questions) {
                return res.status(200).json({
                    success: true,
                    jwt_token: req.token,
                    questions: questions,
                    message: "Success on getAllQuestions"
                });
            })
            .catch(function(err) {
                return res.status(500).json({
                    success: false,
                    message: 'Internal Error'
                });
            });
    } else {
        Question.find({
                copied: false
            }, {
                "html_title": 0,
                "html_body": 0,
                "__v": 0,
                "answer_choices": 0
            })
            .exec()
            .then(function(questions) {
                return res.status(200).json({
                    success: true,
                    jwt_token: req.token,
                    questions: questions,
                    message: "Success on getAllQuestions"
                });
            })
            .catch(function(err) {
                return res.status(500).json({
                    success: false,
                    message: 'Internal Error'
                });
            });
    }
};

var getAllInstructorQuestions = function(req, res) {
    winston.info('questionController: get instructor questions');

    if (req.decodedToken.sub !== req.params.USERID) {
        return res.status(404).json({
            success: false,
            message: 'Not Authorized'
        });
    } else {
        if (req.query.tag !== undefined) {
            Question.find({
                    "instructor_id": req.params.USERID,
                    copied: false,
                    tags: {
                        $all: req.query.tag
                    }
                }, {
                    "html_title": 0,
                    "html_body": 0,
                    "__v": 0,
                    "answer_choices": 0
                })
                .exec()
                .then(function(questions) {
                    return res.status(200).json({
                        success: true,
                        jwt_token: req.token,
                        questions: questions,
                        message: "Success on getAllInstructorQuestions"
                    });
                })
                .catch(function(err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Internal Error'
                    });
                });
        } else {
            Question.find({
                    "instructor_id": req.params.USERID,
                    copied: false
                }, {
                    "html_title": 0,
                    "html_body": 0,
                    "__v": 0,
                    "answer_choices": 0
                })
                .exec()
                .then(function(questions) {
                    return res.status(200).json({
                        success: true,
                        jwt_token: req.token,
                        questions: questions,
                        message: "Success on getAllInstructorQuestions"
                    });
                })
                .catch(function(err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Internal Error'
                    });
                });
        }
        /*
        Question.find({"instructor_id": req.params.USERID, copied: false},
        {"html_title": 0, "html_body": 0, "__v": 0, "answer_choices": 0})
        .exec()
        .then(checkForNull)
        .then(function(questions) {
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                questions: questions,
                message: "Success on getAllInstructorQuestions"
            });
        })
        .catch(function(err) {
            return res.status(500).json({
                success: false,
                message: 'Internal Error'
            });
        });
        */
    }
};

var getQuestion = function(req, res) {
    winston.info('questionController: get question');

    Question.findById(req.params.QUESTIONID, {
            "__v": 0
        })
        .exec()
        .then(checkForNull)
        .then(function(question) {
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                message: 'Request Success',
                question: question
            });
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        });
};

var savedQuestionToDB = function(req, res) {
    winston.info('questionController: save question to database');

    var answer_choices = [];
    for (var i = 0; i < req.body.answer_choices.length; i++) {
        answer_choices.push(req.body.answer_choices[i]);
    }

    var newQuestion = new Question({
        title: req.body.title,
        tags: req.body.tags,
        instructor_id: req.decodedToken.sub,
        html_title: req.body.html_title,
        html_body: req.body.html_body,
        answer_choices: req.body.answer_choices,
        copied: false
    });

    newQuestion.save()
        .then(function(question) {
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                message: 'Question Created',
                question: question
            });
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: err.message
            });
        });
};

var addTag = function(req, res) {
    winston.info('questionController: question add tag');

    Question.findById(req.params.QUESTIONID, function(err, question) {
        if (err || !question) {
            return res.status(404).json({
                success: false,
                message: 'Question Not Found'
            });
        } else {
            if (req.decodedToken.sub !== question.contributor.contributor_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User not Authorized to delete question'
                });
            } else {
                if (req.body.new_tag) {
                    question.tags.push(req.body.new_tag);
                    question.save(function(err, updated_question) {
                        if (err) {
                            return res.status(401).json({
                                success: false,
                                message: 'Add Tag Failed'
                            });
                        } else {
                            return res.status(200).json({
                                success: true,
                                message: 'Tag Added',
                                question: updated_question
                            });
                        }
                    });
                }
            }
        }
    });
};

var deleteTag = function(req, res) {
    winston.info('questionController: delete tag');

    Question.findById(req.params.QUESTIONID, function(err, question) {
        if (err || !question) {
            return res.status(404).json({
                success: false,
                message: 'Question Not Found'
            });
        } else {
            if (req.decodedToken.sub !== question.contributor.contributor_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User not Authorized to delete question'
                });
            } else {
                if (req.body.delete_tag) {
                    Question.update({
                        "_id": req.params.QUESTIONID
                    }, {
                        $pull: {
                            "tags": req.body.delete_tag
                        }
                    }, function(err, data) {
                        if (err || !data || data.nModified === 0) {
                            return res.status(400).json({
                                success: false,
                                message: "Cannot Delete Tag"
                            });
                        } else {
                            return res.status(200).json({
                                success: true,
                                jwt_token: req.token,
                                message: "Tag Deleted",
                                data: data
                            });
                        }
                    });
                }
            }
        }
    });
};

var editProblemStatement = function(req, res) {
    winston.info('questionController: edit problem statement');

    Question.findById(req.params.USERID)
        .exec()
        .then(function(user) {
            user.role = req.body.new_role;
            return user.save();
        })
        .then(function(user) {
            return res.status(200).json({
                success: true,
                jwt_token: req.token,
                message: 'User Role Updated',
                user: user
            });
        })
        .catch(function(err) {
            return res.status(404).json({
                success: false,
                message: 'Unable to Update User Role'
            });
        });

    Question.findById(req.params.QUESTIONID, function(err, question) {
        if (err || !question) {
            return res.status(404).json({
                success: false,
                message: 'Question Not Found'
            });
        } else {
            if (req.decodedToken.sub !== question.contributor.contributor_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User not Authorized to delete question'
                });
            } else {
                if (req.body.new_problem_statement) {
                    question.problem_statement = req.body.new_problem_statement;
                    question.save(function(err, updated_question) {
                        if (err) {
                            return res.status(401).json({
                                success: false,
                                message: 'Problem Statement Failed to Update'
                            });
                        } else {
                            return res.status(200).json({
                                success: true,
                                message: 'Problem Statement Updated',
                                question: updated_question
                            });
                        }
                    });
                }
            }
        }
    });
};

var addAnswerChoice = function(req, res) {
    winston.info('questionController: add answer choice');

    Question.findById(req.params.QUESTIONID, function(err, question) {
        if (err || !question) {
            return res.status(404).json({
                success: false,
                message: 'Question Not Found'
            });
        } else {
            if (req.decodedToken.sub !== question.contributor.contributor_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User not Authorized to delete question'
                });
            } else {
                if (req.body.new_answer_choice) {
                    question.answer_choices.push(req.body.new_answer_choice);
                    question.save(function(err, updated_question) {
                        if (err) {
                            return res.status(401).json({
                                success: false,
                                message: 'Unable to Add Answer Choice'
                            });
                        } else {
                            return res.status(200).json({
                                success: true,
                                message: 'Answer Choice Added',
                                question: updated_question
                            });
                        }
                    });
                }
            }
        }
    });
};

var deleteAnswerChoice = function(req, res) {
    winston.info('questionController: delete answer choice');

    Question.findById(req.params.QUESTIONID, function(err, question) {
        if (err || !question) {
            return res.status(404).json({
                success: false,
                message: 'Question Not Found'
            });
        } else {
            if (req.decodedToken.sub !== question.contributor.contributor_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User not Authorized to delete question'
                });
            } else {
                if (req.body.delete_answer_choice) {
                    Question.update({
                        "_id": req.params.QUESTIONID
                    }, {
                        $pull: {
                            "answer_choices": req.body.delete_answer_choice
                        }
                    }, function(err, data) {
                        if (err || !data || data.nModified === 0) {
                            return res.status(400).json({
                                success: false,
                                message: "Cannot Delete Answer Choice"
                            });
                        } else {
                            return res.status(200).json({
                                success: true,
                                jwt_token: req.token,
                                message: "Answer Choice Deleted",
                                data: data
                            });
                        }
                    });
                }
            }
        }
    });
};

var editAnswerChoice = function(req, res) {
    winston.info('questionController: edit answer choice');

    Question.findById(req.params.QUESTIONID, function(err, question) {
        if (err || !question) {
            return res.status(404).json({
                success: false,
                message: 'Question Not Found'
            });
        } else {
            if (req.decodedToken.sub !== question.contributor.contributor_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User not Authorized to delete question'
                });
            } else {
                if (req.body.edit_answer_choice) {
                    if (req.body.new_answer_choice) {
                        var answerChoiceIndex = question.answer_choices.indexOf("a");
                        question.answer_choices[answerChoiceIndex] = req.body.new_answer_choice;

                        question.save(function(err, updated_question) {
                            if (err) {
                                return res.status(401).json({
                                    success: false,
                                    message: 'Unable to Edit Answer Choice'
                                });
                            } else {
                                return res.status(200).json({
                                    success: true,
                                    message: 'Answer Choice Updated',
                                    question: updated_question
                                });
                            }
                        });
                    }
                }
            }
        }
    });
};

var editAnswer = function(req, res) {
    winston.info('questionController: edit answer');

    Question.findById(req.params.QUESTIONID, function(err, question) {
        if (err || !question) {
            return res.status(404).json({
                success: false,
                message: 'Question Not Found'
            });
        } else {
            if (req.decodedToken.sub !== question.contributor.contributor_id) {
                return res.status(401).json({
                    success: false,
                    message: 'User not Authorized to delete question'
                });
            } else {
                if (req.body.new_answer) {
                    question.answer = req.body.new_answer;
                    question.save(function(err, updated_question) {
                        if (err) {
                            return res.status(401).json({
                                success: false,
                                message: 'Answer Failed to Update'
                            });
                        } else {
                            return res.status(200).json({
                                success: true,
                                message: 'Answer Updated',
                                question: updated_question
                            });
                        }
                    });
                }
            }
        }
    });
};

module.exports = {
    getAllQuestions: getAllQuestions,
    getAllInstructorQuestions: getAllInstructorQuestions,
    getQuestion: getQuestion,
    savedQuestionToDB: savedQuestionToDB,
    editQuestion: editQuestion,
    copyQuestion: copyQuestion,
    deleteQuestion: deleteQuestion,
    addTag: addTag,
    deleteTag: deleteTag,
    editProblemStatement: editProblemStatement,
    addAnswerChoice: addAnswerChoice,
    deleteAnswerChoice: deleteAnswerChoice,
    editAnswerChoice: editAnswerChoice,
    editAnswer: editAnswer
};
