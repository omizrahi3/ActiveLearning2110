/* jshint node: true */

//************************************************************
//  profile.controller.js                                   //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 01/15/17.                   //
//  Copyright © 2016 Jeremy Carter. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  15Jan17     J. Carter  Initial Design                   //
//                                                          //
//************************************************************

var app = angular.module('app');

app.controller('Profile.Controller', function($scope, $element, $localStorage, UserService, RESTService) {
    $scope.edit = false;
    $scope.editTitle = 'Edit Profile';
    $scope.loading = false;
    $scope.newPassword = null;
    $scope.password = null;
    $scope.selectedPhoto = '';
    $scope.croppedPhoto = '';
    $scope.title = 'Profile';
    $scope.error = null;
    syncInfo();

    var img = new Image();
    img.onload = imageToDataUri;
    $scope.$watch('selectedPhoto', function() {
        img.src = $scope.selectedPhoto;
    });

    $scope.editProfile = function() {
        if ($scope.editTitle === 'Edit Profile') {
            $scope.editTitle = 'Save Changes';
            $scope.firstname = $localStorage.firstname;
            $scope.lastname = $localStorage.lastname;
            $scope.edit = !$scope.edit;
            $scope.error = null;
        } else {
            $scope.loading = true;
            updateProfile();
        }
    };

    $scope.closeProfile = function() {
        if ($scope.edit) {
            resetEditProfile();
        } else {
            $element.modal('hide');
        }
    };

    function updateProfile() {
        var info = aggregateInfo();
        if (info) {
            RESTService.UpdateUserInfo(info, infoUpdated);
        } else {
            infoUpdated({success: true});
        }
    }

    function updatePassword() {
        $scope.loading = true;
        if ($scope.password) {
            RESTService.UpdateUserPass({
                cur_password: $scope.password,
                new_password: $scope.newPassword
            }, passFinished);
        } else {
            resetEditProfile();
        }
    }

    function infoUpdated(info) {
        if (!failed(info)) {
            syncInfo();
            updatePassword();
        }
    }

    function passFinished(info) {
        if (!failed(info)) {
            resetEditProfile();
        }
    }

    function failed(info) {
        if (!info.success) {
            $scope.loading = false;
            $scope.error = info.message;
            return true;
        } else {
            return false;
        }
    }

    function resetEditProfile() {
        $scope.selectedPhoto = '';
        $scope.croppedPhoto = '';
        $scope.editTitle = 'Edit Profile';
        $scope.firstname = '';
        $scope.lastname = '';
        $scope.loading = false;
        $scope.edit = false;
        $scope.error = null;
        $scope.password = null;
        $scope.newPassword = null;
    }

    function syncInfo() {
        $scope.username = $localStorage.username;
        $scope.photo = $localStorage.photo;
        $scope.role = $localStorage.role;
        $scope.firstnamePh = $localStorage.firstname;
        $scope.lastnamePh = $localStorage.lastname;
    }

    function aggregateInfo() {
        var info = {};
        if ($scope.croppedPhoto) {
            info.new_photo = $scope.croppedPhoto;
        }
        if ($scope.firstname !== $localStorage.firstname) {
            info.new_firstname = $scope.firstname;
        }
        if ($scope.lastname !== $localStorage.lastname) {
            info.new_lastname = $scope.lastname;
        }
        if (angular.equals(info, {})) {
            return null;
        } else {
            return info;
        }
    }

    function imageToDataUri() {

        var ratio = Math.min(400 / this.width, 300 / this.height);

        var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

        canvas.width = this.width*ratio;
        canvas.height = this.height*ratio;

        ctx.drawImage(this, 0, 0, this.width*ratio, this.height*ratio);

        $scope.croppedPhoto = canvas.toDataURL('image/jpeg', 0.7);
    }
});
