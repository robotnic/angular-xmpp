angular.module("xmppRequests",[])
.directive("xmppfriendrequests",function(){
  return {
        'require': '^xmpp',
        'restrict': 'A',
        'scope': {
            onopenchat:'&onopenchat'
        },
        'transclude': false,
        'templateUrl': 'friendrequests/template.tpl.html',
        'link': function(scope, element, attrs,xmppController) {
            scope.xmpp=xmppController.xmpp;
            scope.openchat=function(jid){
                scope.onopenchat(jid);
            };

            //maybe produces heavy load
            scope.count=function(){
                var count=0;
                for(var i=0;i<scope.xmpp.data.roster.length;i++){
                    if(scope.xmpp.data.roster[i].subscription=="from"){
                        count++;
                    }
                }
                scope.counter=count; //prevent double calc
                return count;
            };

            /**
            * @method confirmContact
            */
            scope.confirmContact=function(jid){
                var jidstring=jid.user+"@"+jid.domain;
            //    scope.xmpp.send( 'xmpp.presence.subscribe', { "to": jidstring });
                scope.xmpp.send( 'xmpp.presence.subscribed', { "to": jidstring });
                scope.xmpp.send( 'xmpp.presence', {});
            };
            /**
            * @method addContact
            */
            scope.addContact=function(jid){
                var jidstring=jid.user+"@"+jid.domain;
                scope.xmpp.send('xmpp.presence.subscribe', { "to": jidstring });
                //scope.xmpp.send( 'xmpp.presence.subscribed', { "to": jidstring });
            };
            /**
            * @method removeContact
            */
            scope.removeContact=function(jid){
                if(!jid.user){
                    jid.user="";
                }
                if(!jid.domain){
                    jid.domain="";
                }
                var jidstring=jid.user+"@"+jid.domain;
                scope.xmpp.send( 'xmpp.presence.unsubscribe', { "to": jidstring });
                scope.xmpp.send( 'xmpp.presence.unsubscribed', { "to": jidstring });
                scope.xmpp.send( 'xmpp.roster.remove', { "jid": jidstring });
            };




        }
    };
});
