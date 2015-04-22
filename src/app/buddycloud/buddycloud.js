/*jslint node: true */
'use strict';


var BC=null;
angular.module("Buddycloud",['BuddycloudNodelist','BuddycloudStream','BuddycloudAffiliations','angularMoment'])
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
                        scope.buddycloud.recent(); 
                    }else{
                        scope.buddycloud.open({node:node}); 
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
            xmppController.xmpp.socket.on("xmpp.logout",function(event,status){
                console.log("LOGOUT");
            });

        }
    };

})
.controller('BuddycloudController',function($scope,$q,BuddycloudFactory){
    console.log("scope",$scope);
    var q=$q.defer();
    this.connect=function(){
        return q.promise;
    };
    $scope.init=function(xmpp){
        if(!$scope.buddycloud){
            console.log("new budddycloud");
            $scope.buddycloud=new BuddycloudFactory(xmpp);
        }
        BC=$scope.buddycloud;
        $scope.buddycloud.init().then(function(){
            $scope.buddycloud.open({node:$scope.node});
            q.resolve($scope.buddycloud);
        });
        
    };
    this.opennode=function(node){
        $scope.onnodechange({node:node});
        console.log("opennode",node);
    };
    window.onscroll=function(){
        var bottomDistance = document.body.offsetHeight -window.innerHeight - window.scrollY;
        if(bottomDistance < 50){
            $scope.buddycloud.loadmore();
        }
    }
})

.filter("gravatar", function() {
        return function(jid) {
            if (!jid) {
                jid = "fehler@teufel.com";
            }
            var jidstring = 'recent';
            if (typeof(jid) == "string") {
                if (jid !== 'recent') {
                    jidstring = trimjidstring(jid);
                }
            } else {
                jidstring = jid.user + "@" + jid.domain;
            }
            var hash = hashCode(jidstring);
            var url = "http://www.gravatar.com/avatar/" + hash + "?d=monsterid&f=y";
            return url;
        };

        function hashCode(s) {
            s = s.split("").reduce(function(a, b) {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
            }, 0);
            s = Math.abs(parseInt(s,10));
            return s;
        }

        function trimjidstring(jid) {
            var user = jid.split("@")[0];
            var domain = jid.split("@")[1];
            if (user.indexOf("/") !== -1) {
                user = user.substring(user.lastIndexOf("/") + 1);
            }
            if (domain.indexOf("/") !== -1) {
                domain = domain.substring(0, domain.indexOf("/"));
            }
            return user + "@" + domain;
        }

    }

);

