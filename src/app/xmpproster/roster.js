/*jslint node: true */
'use strict';
var ROSTER=null;

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
            console.log("ROSTER",xmpp.xmpp);
            ROSTER=scope;
            scope.xmpp=xmpp.xmpp;
            scope.xmpp.socket.on("xmpp.connection",function(event,status){
                    scope.xmpp.send("xmpp.roster.get").then(function(){;
                        scope.xmpp.send("xmpp.presence");
                    });
            });

            scope.openchat=function(jid){
                console.log("----",jid);
                scope.onopenchat({jid:jid});
            }
            scope.addContact=function(jid){
                scope.xmpp.send('xmpp.presence.subscribe',{to:jid});
            }
        }
    };

});

