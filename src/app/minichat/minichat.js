var DD=null;
var Q=null;

angular.module('Minichat', ['AngularXmppServices','luegg.directives'])
//luegg.directives for scroll cha down

/*
Roster
*/

.directive('xmppminichat', function() {
    return {
        'require': '^xmpp',
        'restrict': 'E',
        'scope': {
            oninit:'&oninit',
            onopennode:'&onopennode',
            onvideochat:'&onvideochat'
        },
        'transclude': false,
        'templateUrl': 'minichat/template.tpl.html',
        'controller': 'XmppUiMinichat',
        'link': function(scope, element, attrs,xmppController) {
            scope.xmpp=xmppController.xmpp;
            scope.oninit({scope:scope});
            xmppController.xmpp.socket.on("xmpp.connection",function(event,status){
                scope.init(xmppController.xmpp);
            });
            if(xmppController.xmpp.data.connected){
                scope.init(xmppController.xmpp);
            }
        }
    };
})





.controller('XmppUiMinichat', ['$scope', '$rootScope',  '$anchorScroll', 'Xmpp',
    function($scope, $rootScope,  $anchorScroll, Xmpp) {
        DD=$scope;
        $scope.init=function(xmpp){
            $scope.chatwindows = [];
            $scope.oninit({scope:$scope});

            $scope.openchat=function(jid){
                if(typeof(jid)!=="string"){ 
                    jid=jid.user+"@"+jid.domain;
                }
                xmpp.messages.markread(jid);
                
                var fromname = jid.substring(0, jid.indexOf("@"));
                for (var i = 0; i < $scope.chatwindows.length; i++) {
                    if ($scope.chatwindows[i].jid == jid) {
                        $scope.chatwindows[i].style = "max";
                        return;  //---window already open
                    }
                }
                $scope.chatwindows.push({
                    jid: jid,
                    style: "max",
                    name: fromname
                });
            };


            //make chat window big
            $scope.makebig = function(user) {
                user.style = "max";
            };
    
            //close chat window
            $scope.close = function(user) {
                user.style = false;
                for(var i=0;i<$scope.chatwindows.length;i++){
                    if($scope.chatwindows[i].jid==user.jid){
                        $scope.chatwindows.splice(i,1);
                    }
                }
            };

            //make chat window small
            $scope.minify = function(user) {
                user.style = "min";
            };

            //send chat message 
            $scope.send = function(user, text) {
                $scope.xmpp.messages.send({to:user.jid,content:user.newtext});
                user.newtext = "";
            };
        };
    }
]);
