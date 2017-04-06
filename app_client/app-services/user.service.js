/* jshint node: true */

//************************************************************
//  user.service.js                                         //
//  Active Learning 2110                                    //
//                                                          //
//  Created by Jeremy Carter on 01/12/17.                   //
//  Copyright © 2016 Odell Mizrahi. All rights reserved.    //
//                                                          //
//  Date        Name        Description                     //
//  -------     ---------   --------------                  //
//  12Jan17     J. Carter  Initial Design                   //
//  15Jan17     J. Carter  Moved in ShowLogin & created     //
//                          ShowACCourse                    //
//************************************************************
var app = angular.module('app');

app.factory('UserService', function($state, $localStorage, $ocLazyLoad, ModalService) {

    var service = {};

    service.ShowLogin = function() {
        $ocLazyLoad.load('login').then(function() {
            ModalService.showModal({
                templateUrl: '/app-components/modals/login/login.view.html',
                controller: 'Login.Controller'
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    if (result) {
                        $state.go('main.' + $localStorage.role);
                    }
                    $('.modal-backdrop').remove();
                });
            });
        });
    };

    service.ShowProfile = function() {
        $ocLazyLoad.load('profile').then(function() {
            ModalService.showModal({
                templateUrl: '/app-components/modals/profile/profile.view.html',
                controller: 'Profile.Controller'
            }).then(function(modal) {
                modal.element.modal();
            });
        });
    };

    service.ShowJoinCourse = function() {
        $ocLazyLoad.load('student.join_course').then(function() {
            ModalService.showModal({
                templateUrl: '/app-components/modals/join_course/join_course.view.html',
                controller: 'Join.Course.Controller'
            }).then(function(modal) {
                modal.element.modal();
            });
        });
    };

    service.ShowCreateCourse = function() {
        $ocLazyLoad.load('instructor.create_course').then(function() {
            ModalService.showModal({
                templateUrl: '/app-components/modals/create_course/create_course.view.html',
                controller: 'Create.Course.Controller'
            }).then(function(modal) {
                modal.element.modal();
            });
        });
    };

    service.ShowCreateLecture = function() {
        $ocLazyLoad.load('instructor.create_lecture').then(function() {
            ModalService.showModal({
                templateUrl: '/app-components/modals/create_lecture/create_lecture.view.html',
                controller: 'Create.Lecture.Controller'
            }).then(function(modal) {
                modal.element.modal();
            });
        });
    };

    service.ShowQuestionPreview = function(info) {
        $ocLazyLoad.load('instructor.question_preview').then(function() {
            ModalService.showModal({
                templateUrl: '/app-components/modals/question_preview/question_preview.view.html',
                controller: 'Question.Preview.Controller',
                inputs: {
                    title: info.title,
                    body: info.body,
                    tags: info.tags,
                    choices: info.choices
                }
            }).then(function(modal) {
                modal.element.modal();
            });
        });
    };

    return service;
});

app.directive("picread", [function() {
    return {
        scope: {
            picread: "="
        },
        link: function(scope, element, attributes) {
            element.on("change", function(changeEvent) {
                var reader = new FileReader();
                reader.onload = function(loadEvent) {
                    scope.$apply(function() {
                        scope.picread = loadEvent.target.result;
                        element.val(null);
                    });
                };
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    };
}]);

app.directive("fileread", [function() {
    return {
        scope: {
            fileread: "="
        },
        link: function(scope, element, attributes) {
            element.on("change", function(changeEvent) {
                scope.$apply(function() {
                    scope.fileread = changeEvent.target.files[0];
                    element.val(null);
                });
            });
        }
    };
}]);

app.directive('ngEditor', function() {

    function base64ImageUploader(dialog) {
        var reader, image_url, img, width, height;
        var canvas = document.createElement("canvas");
        var canvas_context = canvas.getContext('2d');


        function rotateImage(direction) {
            canvas.width = height;
            canvas.height = width;
            canvas_context.rotate(direction * Math.PI / 2);
            if (direction > 0) {
                canvas_context.translate(0, -canvas.height);
            } else {
                canvas_context.translate(-canvas.width, 0);
            }
            canvas_context.drawImage(img, 0, 0);
            setImageFromDataURL(canvas.toDataURL("image/png"), img.alt);
        }

        function setImageFromDataURL(data_url, file_name) {
            image_url = data_url;
            img = new Image();
            img.src = image_url;
            img.onload = function() {
                img.alt = file_name;
                width = this.width;
                height = this.height;
                dialog.populate(image_url, [width, height]);
            };
        }

        function cropImage(crop_region) {
            canvas.width = width * crop_region[2];
            canvas.height = height * crop_region[3];
            canvas_context.translate(-width * crop_region[0], -height * crop_region[1]);
            canvas_context.drawImage(img, 0, 0);
            setImageFromDataURL(canvas.toDataURL("image/png"), img.alt);
        }

        dialog.addEventListener('imageuploader.cancelUpload', function() {

        });

        dialog.addEventListener('imageuploader.clear', function() {
            dialog.clear();
            img = null;
        });

        dialog.addEventListener('imageuploader.fileready', function(ev) {
            var reader = new FileReader();
            if (ev) {
                var file = ev.detail().file;
                reader.readAsDataURL(file);
                reader.addEventListener('load', function() {
                    setImageFromDataURL(reader.result, file.name);
                });
            }
        });


        dialog.addEventListener('imageuploader.rotateccw', function() {
            rotateImage(-1);
        });

        dialog.addEventListener('imageuploader.rotatecw', function() {
            rotateImage(1);
        });

        dialog.addEventListener('imageuploader.save', function() {
            if (dialog.cropRegion()) {
                cropImage(dialog.cropRegion());
            }
            dialog.save(
                image_url, [width, height], {
                    'alt': img.alt,
                    'data-ce-max-width': width
                }
            );
        });
    }

    function link(scope, element, attrs) {
        ContentTools.IMAGE_UPLOADER = base64ImageUploader;
        scope.editor = new ContentTools.EditorApp.get();
        scope.editor.init('*[data-editable], *[data-fixture]', 'data-editable', null, false);

        scope.editor.addEventListener('saved', function(ev) {
            var payload = {};
            var regions = scope.editor.regions();
            for (var postId in regions) {
                payload[postId] = regions[postId].html();
                if (postId === 'title') {
                    payload.titleText = regions[postId]._domElement.innerText.trim();
                }
            }
            scope.value = payload;
        });
    }
    return {
        restrict: 'A',
        scope: {
            editor: '=editor',
            value: '=value'
        },
        link: link
    };
});

app.directive('ngConfirmClick', [
        function() {
        return {
            link: function(scope, element, attr) {
                var msg = attr.ngConfirmClick || "Are you sure?";
                var clickAction = attr.confirmedClick;
                element.bind('click', function(event) {
                    if (window.confirm(msg)) {
                        scope.$apply(clickAction);
                    }
                });
            }
        };
    }]);

app.filter('gradecolor', function() {
    return function(grade) {
        if (grade < 50) {
            return "#EF4723";
        } else if (grade < 70) {
            return "#FF851B";
        } else {
            return "#2D76E8";
        }
    };
});

app.filter('days', function() {
    return function(str) {
        return str.includes("mon") ? "MWF" : "TR";
    };
});

app.filter('offset', function() {
    return function(input, start) {
        return input.slice(start);
    };
});
