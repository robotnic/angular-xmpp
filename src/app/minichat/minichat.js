MESSAGES=null;
CHAT=null;
angular.module('Minichat', ['AngularXmpp','luegg.directives'])
//luegg.directives for scroll cha down

/*
Roster
*/

.directive('xmppminichat', function() {
    return {
        'require': '^xmpp',
        'restrict': 'E',
        'scope': {
            oninit:'&oninit'
        },
        'transclude': false,
        'templateUrl': 'minichat/template.tpl.html',
        'controller': 'XmppUiMinichat',
        'link': function(scope, element, attrs,xmppController) {
            console.log("minichat",xmppController);
            scope.xmpp=xmppController.xmpp;
            xmppController.on("connected",function(event,status){
                scope.init(xmppController.xmpp);
            });
            xmppController.on("openchat",function(event,status){
                console.log("realopenchat",event,status);
                scope.openchat(event,status);
            });

        }
    };
})





.controller('XmppUiMinichat', ['$scope', '$rootScope',  '$anchorScroll', 'Xmpp','MessageFactory',
    function($scope, $rootScope,  $anchorScroll, Xmpp, MessageFactory) {
        CHAT=$scope;
        $scope.init=function(xmpp){
            var chat=new MessageFactory(xmpp);
            $scope.chat=chat;
            console.log("minichatcontroller",chat);
            $scope.username = Xmpp.user;
            $scope.chatwindows = [];
            $scope.messages = chat.messages;
            $scope.notifications = chat.notifications;
            $scope.oninit({scope:$scope});

            //use broadcast to open chat window
//            $rootScope.$on("openchat", function(data, jid) {
            $scope.openchat=function(event,jid){
                console.log("inside minichat",event,jid);
                if(typeof(jid)!=="string"){ 
                    jid=jid.jid.user+"@"+jid.jid.domain;
                }
                chat.markread(jid);
                console.log("chatjid",jid);
                $scope.me = xmpp.me;
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


            //big, small, close window
            $scope.makebig = function(user) {
                user.style = "max";
            };
            $scope.close = function(user) {
                user.style = false;
                for(var i=0;i<$scope.chatwindows.length;i++){
                    if($scope.chatwindows[i].jid==user.jid){
                        $scope.chatwindows.splice(i,1);
                    }
                }
            };
            $scope.minify = function(user) {
                user.style = "min";
            };

            //send chat message 
            $scope.send = function(user, text, event) {
                console.log(user, text, event);
                //chat.send(user, text, event);
                chat.send({to:user.jid,content:user.newtext});
                user.newtext = "";
            };

        };
    }
]);
