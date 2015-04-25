/*jslint node: true */
'use strict';

angular.module("XmppRoster",[])
.directive("xmpproster",function(){
    console.log("dir");
    return {
        'require': '^xmpp',
        'templateUrl': 'xmpproster/template.tpl.html',
        'restrict': 'E',
        'scope': {
            onopenchat:'&onopenchat'
        },
        'transclude': false,
        'link': function(scope, element, attrs,xmpp) {
            scope.xmpp=xmpp.xmpp;
            scope.xmpp.socket.on("xmpp.connection",function(event,status){
                scope.xmpp.send("xmpp.roster.get").then(function(){
                    scope.xmpp.send("xmpp.presence");
                });
            });

            scope.openchat=function(jid){
                scope.onopenchat({jid:jid});
            };
            scope.addContact=function(jid){
                scope.xmpp.send('xmpp.presence.subscribe',{to:jid});
            };
            scope.messagecount=function(user){
                var jid=user.user+"@"+user.domain;
                return scope.xmpp.chat.notifications.unread[jid];
            };
        }
    };

});

