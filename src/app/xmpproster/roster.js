/*jslint node: true */
//'use strict';

angular.module("XmppRoster",[])
.directive("xmpproster",function(){
    console.log("dir");
    return {
        'require': '^xmpp',
        'templateUrl':function(elem,attrs) {
           return attrs.templateUrl || 'xmpproster/template.tpl.html';
        },
        'restrict': 'E',
        'scope': {
            onopenchat:'&onopenchat',
            onnodechange:'&onnodechange'
        },
        'transclude': false,
        'link': function(scope, element, attrs,xmpp) {
            scope.xmpp=xmpp.xmpp;
            scope.xmpp.socket.on("xmpp.connection",function(event,status){
                scope.xmpp.send("xmpp.roster.get").then(function(){
                    scope.xmpp.send("xmpp.presence",{"show":"online"});
                });
            });

            scope.opennode=function(jid){
                var node="/user/"+jid.user+"@"+jid.domain+"/posts";
                scope.onnodechange({node:node});
            };
            scope.openchat=function(jid){
                scope.onopenchat({jid:jid});
            };
            scope.messagecount=function(user){
                var jid=user.user+"@"+user.domain;
                if(scope.xmpp.messages.byjid[jid]){
                    return scope.xmpp.messages.byjid[jid].unread;
                }else{
                    return 0;
                }
            };
        }
    };

});

