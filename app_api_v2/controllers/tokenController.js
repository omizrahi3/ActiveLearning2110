/* jshint node: true */
/* jshint esversion: 6 */

//************************************************************
//  tokenController.js                                      //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Odell Mizrahi on 9/18/16.                    //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  01Jan17     O. Mizrahi  Initial Design                  //
//                                                          //
//************************************************************
"use strict";

var User = require('./../models/userModel'),
    jwt = require('jsonwebtoken'),
    config = require('./../../config'),
    winston = require('winston');

var SIXTY_MINUTES = 60;
var TEN_MINUTES = 600;

function clearCookieJWT(res, callback) {
    winston.info('tokenController: clear cookie JWT');

    res.clearCookie('jwtToken');
    callback();
}

function setCookieJWT(res, token, callback) {
    winston.info('tokenController: set cookie JWT');

    res.cookie('jwtToken', token, {
        httpOnly: true
    });
    callback();
}

var clearToken = function(req, res) {
    winston.info('tokenController: clear token');

    clearCookieJWT(res, function() {
        if (req.user_deleted) {
            return res.status(200).json({
                success: true,
                message: 'User Deleted/Token Cleared'
            });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Token Cleared'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Token Cleared'
        });
    });
};

var generateToken = function(req, res) {
    winston.info('tokenController: generate token');

    var claims = {
        exp: Math.floor(Date.now() / 1000) + (60 * SIXTY_MINUTES),
        iss: 'activelearning2110.com',
        sub: req.user_id,
        role: req.user_role
    };

    jwt.sign(claims, config.jwt_secret, {}, function(err, token) {
        if (err) {
            return res.status(401).json({
                success: false,
                error: err
            });
        } else {
            setCookieJWT(res, token, function() {

                return res.status(200).json({
                    success: true,
                    message: 'Authentication Successful',
                    user_id: req.user_id,
                    jwt_token: token
                });
            });
        }
    });
};

var refreshToken = function(req, res, next) {
    winston.info('tokenController: refresh token');

    var timeInS = Math.floor(Date.now() / 1000);
    var secondsTilExp = req.decodedToken.exp - timeInS;

    if (secondsTilExp < TEN_MINUTES) {
        var claims = {
            exp: Math.floor(Date.now() / 1000) + (60 * SIXTY_MINUTES),
            iss: req.decodedToken.iss,
            sub: req.decodedToken.sub,
            role: req.decodedToken.role
        };

        jwt.sign(claims, config.jwt_secret, {}, function(err, token) {
            if (!err) {
                setCookieJWT(res, token, function() {
                    req.token = token;
                    next();
                });
            }
        });
    } else {
        next();
    }
};

var validateToken = function(req, res, next) {
    winston.info('tokenController: validate token');
    var token = req.cookies.jwtToken || req.headers.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'User Has No Token'
        });
    } else {

        jwt.verify(token, config.jwt_secret, function(err, decode) {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Token'
                });
            } else {
                req.token = token;
                req.decodedToken = decode;
                next();
            }
        });
    }
};

module.exports = {
    clearToken: clearToken,
    generateToken: generateToken,
    refreshToken: refreshToken,
    validateToken: validateToken
};
