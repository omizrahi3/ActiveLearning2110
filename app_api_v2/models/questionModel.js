/* jshint node: true */

//************************************************************
//  questionModel.js                                        //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Amy Zhuang on 02/05/17.                      //
//  Copyright © 2017 Amy Zhuang. All rights reserved.       //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  02Feb05     A. Zhuang   Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var QuestionSchema  = new Schema(
{
    contributor:
    {
        contributor_id:
        {
            type        : String,
            required    : true
        },
        username:
        {
            type        : String,
            required    : true,
            unique      : true,
            lowercase   : true
        },
        firstname:
        {
            type        : String,
            lowercase   : true
        },
        lastname:
        {
            type        : String,
            lowercase   : true
        }
    },
    tags: 
    {
        type        : [String],
        required    : true,
        lowercase   : true
    },
    problem_statement: 
    {
        type        : String,
        required    : true,
    },
    answer_choices: 
    {
        type        : [String],
        required    : true
    },
    answer:
    {
        type        : Number,
        required    : true
    }
});

module.exports = mongoose.model('Question', QuestionSchema);
