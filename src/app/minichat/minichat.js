MESSAGES=null;
angular.module('Minichat', ['XmppCore','luegg.directives'])
//luegg.directives for scroll cha down

/*
Roster
*/

.directive('xmppminichat', function() {
    return {
        'require': '^xmpp',
        'restrict': 'E',
        'scope': {
            'oninit':'&'
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

.factory('XmppMessage',['$q',function($q){
    return function(Xmpp){
        function watch(){
            //notify is used to apply changes (render html);
            var q=$q.defer();
            Xmpp.socket.on('xmpp.chat.message', function(message) {
                if(!message.delay){
                    message.receivetime=(new Date()).getTime();
                }
                message.from.jid=message.from.user+"@"+message.from.domain;
                console.log("message",message);
                if(message.state){
                    if(message.state=="composing"){
                        api.notifications.composing[message.from.jid]=true;
                    }
                    if(message.state=="paused"){
                        api.notifications.composing[message.from.jid]=false;
                    }
                }

                if(message.content){
                    message.unread=true;
                    api.messages.push(message);

                    api.notifications.unreadmessages++;
                    api.notifications.messages[message.from.jid]=message;
                    if(!api.notifications.unread[message.from.jid]){
                        api.notifications.unread[message.from.jid]=0;
                    }
                    api.notifications.unread[message.from.jid]++;
                    api.notifications.composing[message.from.jid]=false;
                    console.log("boop");
                    beep();
                }
                q.notify(message);
            });
            return q.promise;
        }

        function beep() {
            var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
            snd.play();
        }

        var api={
            messages:[],        
            notifications: {
                unreadmessages:0,
                unread:{},
                messages:{},
                composing:{}
            },
            watch:function(){
                return watch();
            },
            send:function(user, text, event) {
                var message = {
                    to: user.jid,
                    type: "chat",
                    content: user.newtext
                };
                api.messages.push(message);
                Xmpp.socket.send('xmpp.chat.message', message);
            },
            markread:function(jid){
                api.notifications.unread[jid]=0;
                api.notifications.messages[jid]=[];
                var sum=0;
                for(var m in api.notifications.unread){
                   sum+=api.notifications.unread[m]; 
                }
                api.notifications.unreadmessages=sum;
            }

        };
        MESSAGES=api;  //debug only;
        return api;
    };
}])






.controller('XmppUiMinichat', ['$scope', '$rootScope',  '$anchorScroll', 'Xmpp','XmppMessage',
    function($scope, $rootScope,  $anchorScroll, Xmpp, XmppMessage) {
        $scope.init=function(xmpp){
            var chat=new XmppMessage(xmpp);
            console.log("minichatcontroller",chat);
            $scope.username = Xmpp.user;
            $scope.chatwindows = [];
            $scope.messages = chat.messages;
            $scope.notifications = chat.notifications;
            $scope.oninit({scope:$scope});
            chat.watch().then(
                function(end){},
                function(error){
                    console.log(error);
                },
                function(notify){
                    for(var i=0;i<$scope.chatwindows.length;i++){
                            if($scope.chatwindows[i].jid==notify.from.jid){ 
                                chat.markread(notify.from.jid);
                            }
                    }
                }
            );

            //use broadcast to open chat window
//            $rootScope.$on("openchat", function(data, jid) {
            $scope.openchat=function(event,jid){
                console.log("inside minichat",event,jid);
                if(typeof(jid)!=="string"){ 
                    jid=jid.jid.user+"@"+jid.jid.domain;
                }
                chat.markread(jid);
                console.log("chatjid",jid);
                $scope.me = xmpp.jid.substring(0, xmpp.jid.indexOf("@"));
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
                chat.send(user, text, event);
                user.newtext = "";
            };

        };
    }
]);
