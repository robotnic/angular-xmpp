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
                scope.avatar=scope.bc.xmpp.data.me.jid;
    console.log("///////////////",scope.bc.xmpp.data.me.jid);
            });

        }
    };

})

.controller("SettingsController",function($scope,$http,Upload,$timeout){
    var baseUrl="https://demo.buddycloud.org/api/";
    var settingsUrl=baseUrl+"/notification_settings?type=email";

    $scope.getSettings=function(){
        var cred=$scope.bc.xmpp.model.credentials.request;
        $http.defaults.headers.common['Authorization'] = 'Basic ' + btoa(cred.jid+":"+cred.password);

        $http.get(settingsUrl,{credentials:true}).then(function(response){
            console.log(response.data);
            $scope.settings=response.data;

            //workaroud: https://github.com/buddycloud/buddycloud-server-java/issues/300
            for(var item in $scope.settings[0]){
                if(item!="target"){
                    if($scope.settings[0][item]=="true"){
                        $scope.settings[0][item]=true;
                    }else{
                        $scope.settings[0][item]=false;
                    }
                }
                console.log(item);
            }
        });
    }


    $scope.setSettings=function(){
//        $http.get(settingsUrl,{credentials:true})

            //workaroud: https://github.com/buddycloud/buddycloud-server-java/issues/300



        $http({
            url: baseUrl+"/notification_settings",
            method: "POST",
            data: $scope.settings,
            credentials:true
        }).then(function(response){

            console.log("saved",response);
        },function(error){
            console.log("error",error);
            $scope.error=error;
        });
    }


    $scope.$watch('files', function () {
        console.log($scope.files);
        if($scope.files){
            $scope.upload($scope.files);
        }
    });

    $scope.upload = function (files) {
        var cred=$scope.bc.xmpp.model.credentials.request;
        var uploadurl=baseUrl+cred.jid+"/media/avatar";
        console.log( uploadurl);
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    method:"PUT",
                    headers : {
                        'Content-Type': file.type,
                        'Authorization':'Basic '+btoa(cred.jid+":"+cred.password)
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
                    //trick to really load the image - not really good
                    $scope.avatar="";
                    $timeout(function(){
                        $scope.avatar=$scope.bc.xmpp.data.me.jid;
                    },1000);
                });
            }
        }
    };


});
