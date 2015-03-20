// actions:
// Actions for items: reply to item, delete, update, block user, like, make a user a moderator, change a user from a being able to post to being read-only

/**
* Buddycloud module provides a timeline.
@module buddycloud
*/


var BC = null;
var BCAPI = null;
var LIKE = null;




angular.module('Buddycloud', [])

/**
Directive
@ngdoc directive
*/

.directive('buddycloud', function() {
    return {
        'require': '^xmpp',
        'restrict': 'E',
        'scope': {
            'search': '@',
            'node': '@',
            'jid': '=',
            'onchangenode': '&onchangenode',
            'oninit': '&oninit'
        },
        'transclude': false,
        'templateUrl': 'buddycloud/template.tpl.html',
        'controller': 'buddycloudController',
        'link': function(scope, element, attrs, xmppController) {


            //scope.node = attrs.node;
            scope.$watch("node",function(){
                if(scope.buddycloud){
                    scope.buddycloud.open({node:attrs.node});
                }
            });


            if (xmppController.xmpp.data.connected) {
                scope.init(xmppController.xmpp);
            } else {
                xmppController.on("connected", function(s, status) {
                    scope.init(xmppController.xmpp);
                });

            }

        }
    };
})





//todo: put more to factory, controll is tool long

.controller('buddycloudController', ['$scope', 'BuddycloudFactory',
    function($scope, BuddycloudFactory) {
        BC=$scope;
        $scope.editmode={};
        $scope.showconfigform=false;
        $scope.init=function(xmpp){
            $scope.buddycloud=new BuddycloudFactory(xmpp);
            console.log("--",$scope.buddycloud);
            $scope.buddycloud.init().then(function(){
                console.log("bc init");
                if($scope.node){
                    $scope.buddycloud.open({node:$scope.node});
                }else{

                }
            },function(error){
                console.log("bc error",error);
            });
        }
        $scope.setConfig=function(data){
            console.log("this is buddyclodu.js",data);
            $scope.buddycloud.send("xmpp.buddycloud.config.set",{node:$scope.buddycloud.data.currentnode,form:data});
        }
        $scope.opennode=function(id){
            console.log(id);
            var node="/user/"+id+"/posts";
            $scope.onchangenode({node:node});
        }
        $scope.oninit({scope:$scope});
    }
]);

