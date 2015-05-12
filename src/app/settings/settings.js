/*jslint node: true */
//'use strict';

angular.module("Settings",['ngFileUpload'])
.directive("settings",function(){
    console.log("dir");
    return {
        'require': '^buddycloud',
        'templateUrl': 'settings/template.tpl.html',
        'restrict': 'E',
        'scope': {

        },
        'transclude': false,
        'controller': "SettingsController",
        'link': function(scope, element, attrs,events) {
            scope.events=events;
            events.connect().then(function(bc){
                scope.bc=bc;
                scope.xmpp=bc.xmpp.model;
                console.log("connected");
            });

        }
    };

})

.controller("SettingsController",function($scope,Upload){
    var baseUrl="https://demo.buddycloud.org/api/";
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

    $scope.upload = function (files) {
        var cred=$scope.bc.xmpp.model.credentials.request;
        var uploadurl=baseUrl+cred.jid+"/media/avatar";
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    method:"PUT",
                    headers : {
                        'Content-Type': file.type,
                        'Authorization':btoa(cred.jid+":"+cred.password)
                        //'Authorization':btoa("u9:nix")
                    },
                    url: uploadurl,
                    fileFormDataName:'data',
                    fileName: 'filename',
                    file: file
                }).progress(function (evt) {
                    console.log(evt);
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                });
            }
        }
    };


});
