/*jslint node: true */
//'use strict';

angular.module("BuddycloudRecommondations",[])
.directive("buddycloudRecommondations",function(){
    console.log("dir");
    return {
        'require': '^buddycloud',
        'templateUrl': 'buddycloud-recommondations/template.tpl.html',
        'restrict': 'E',
        'scope': {
            onnodechange:'&onnodechange'
        },
        'transclude': false,
        'controller': "recommondationsController",
        'link': function(scope, element, attrs,events) {
            scope.events=events;
            events.connect().then(function(bc){
                scope.bc=bc;
                scope.init();
            });
            scope.opennode=function(node){
                var node="/user/"+node+"/posts";
                scope.onnodechange({node:node});
            }; 

        }
    };

})
.controller("recommondationsController",function($scope,$http){
    $scope.init=function(){
        var jid=$scope.bc.xmpp.data.me.jid;
//        var jidstring=jid.user+"@"+jid.domain;
        var jidstring="robotnic@laos.buddycloud.com";
        var url="https://demo.buddycloud.org/api/recommendations?max=5&user="+jidstring;
        console.log("url",url);
        $scope.url=url;
        $http.get(url).then(function(response){
            console.log(response.data);
            $scope.recommondations=response.data;
        },function(error){
            console.log(error);
        });
    }
});
