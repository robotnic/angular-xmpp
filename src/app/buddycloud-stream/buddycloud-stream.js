/*jslint node: true */
'use strict';

var UP=null;

angular.module("BuddycloudStream",['btford.markdown','naif.base64'])
.directive("buddycloudStream",function(){
    console.log("dir");
    return {
        'require': '^buddycloud',
        'templateUrl': 'buddycloud-stream/template.tpl.html',
        'restrict': 'E',
        'scope': {
            onnodechange:'&onnodechange'
        },
        'controller': 'streamController',
        'transclude': false,
        'link': function(scope, element, attrs,events) {
            scope.events=events;
            UP=scope;
            events.connect().then(function(bc){
                scope.bc=bc;
            });
            scope.reply=function(event,item,input){
                if(event.keyCode == 13){
                    item.reply(input.text);
                    input.text="";
                }
            }
            scope.setConfig=function(data){
                console.log("new config data",data);
                scope.bc.send("xmpp.buddycloud.config.set",{node:scope.bc.data.currentnode,form:data});

            }
            scope.opennode=function(node){
                console.log("node",node);
                scope.onnodechange(node);
            };
            scope.media={};
/*
            scope.loadmore=function(){
                alert("very good");
            }
*/
        }
    };

})

.controller("streamController",function($scope,$http){
            $scope.$watch("media.upload",function(){
                console.log($scope.media);
                if(!$scope.media.upload)return;
                var json={
                 "data": $scope.media.upload.base64,
                 "content-type": $scope.media.upload.filetype,
                 "filename": "image.png",
                 "title": "Juliet's prom pic",
                 "description": "Juliet's beautiful prom pic!"
                 }
                console.log(json);
                var me=$scope.bc.xmpp.data.me.jid;
                var jid=me.user+"@"+me.domain;
                console.log(me,jid);
                var url="https://buddycloud.com/api/"+jid+"/media";
                $http({method:"POST",url:url,data:json}).then(function(response){
                    console.log(response.data);
                },function(error){
                    console.log("upload error",error);
                });
            });

});

