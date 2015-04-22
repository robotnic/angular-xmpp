/*jslint node: true */
'use strict';
var NODELIST=null;

angular.module("BuddycloudNodelist",[])
.directive("buddycloudNodelist",function(){
    console.log("dir");
    return {
        'require': '^buddycloud',
        'templateUrl': 'buddycloud-nodelist/template.tpl.html',
        'restrict': 'E',
        'scope': {
            onnodechange:'&onnodechange'
        },
        'transclude': false,
        'link': function(scope, element, attrs,events) {
            scope.events=events;
            events.connect().then(function(bc){
                scope.bc=bc;
            });
            scope.opennode=function(node){
                scope.onnodechange({node:node});
            };
        }
    };

});

