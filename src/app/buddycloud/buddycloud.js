/*jslint node: true */
//'use strict';
BC=null;

angular.module("Buddycloud",['BuddycloudNodelist','BuddycloudStream','BuddycloudAffiliations','BuddycloudMedia','angularMoment'])
.directive("buddycloud",function(){
    return {
        'require': '^xmpp',
        'restrict': 'E',
        'scope': {
            node:'=node',
            oninit:'&oninit',
            onnodechange:'&onnodechange'
        },
        'transclude': false,
        'controller': 'BuddycloudController',
        'link': function(scope, element, attrs,xmppController) {
            console.log("buddycloud",scope.node,xmppController);
            scope.xmpp=xmppController.xmpp;
            scope.$watch("node",function(node){
                console.log("watched this",node);
                //if connected already
                if(scope.buddycloud){
                    if(node=="recent"){
                        scope.buddycloud.recent({parentOnly:true,rsm:{max:24}}); 
                    }else{
                        scope.buddycloud.open({node:node,parentOnly:true}); 
                    }
                }
            });
    
            xmppController.xmpp.socket.on("xmpp.connection",function(event,status){
                console.log("connect");
                //on startup
                scope.init(xmppController.xmpp); /*.then(function(){
                    scope.buddycloud.open({node:node}); 
                });*/
            });
            if(xmppController.xmpp.data.connected){
                scope.init(xmppController.xmpp);
            }
            xmppController.xmpp.socket.on("xmpp.logout",function(event,status){
                console.log("LOGOUT");
            });

        }
    };

})
.controller('BuddycloudController',['$scope','$q','BuddycloudFactory','$window','$document',function($scope,$q,BuddycloudFactory,$window,$document){
    console.log("scope",$scope);
    var q=$q.defer();
    this.connect=function(){
        return q.promise;
    };
    $scope.init=function(xmpp){
        if(!$scope.buddycloud){
            console.log("new budddycloud");
            $scope.buddycloud=new BuddycloudFactory(xmpp);
            console.log("new budddycloud",$scope.buddycloud);
            BC=$scope.buddycloud;
        }
        $scope.buddycloud.init().then(function(){
            //$scope.buddycloud.open({node:$scope.node});
            //q.resolve($scope.buddycloud);

            if($scope.node=="recent"){
                $scope.buddycloud.recent({parentOnly:true,rsm:{max:29}}); 
            }else{
                $scope.buddycloud.open({node:$scope.node,rsm:{max:30},parentOnly:true}); 
            }
            q.resolve($scope.buddycloud);
            $scope.oninit({bc:$scope.buddycloud});
        });
        
    };
    this.opennode=function(node){
        $scope.onnodechange({node:node});
        console.log("opennode",node);
    };
    $window.onscroll=function(){
        var bottomDistance = $document[0].body.offsetHeight -$window.innerHeight - $window.scrollY;
        if(bottomDistance < 100){
            $scope.buddycloud.loadmore({parentOnly:true,rsm:{max:10}});
        }
    };
}]);

