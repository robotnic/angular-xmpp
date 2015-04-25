angular.module("xmppNotifications",[])
.directive("xmppnotifications",function(){
  return {
        'require': '^xmpp',
        'restrict': 'A',
        'scope': {
            onopenchat:'&onopenchat'
        },
        'transclude': false,
        'templateUrl': 'notifications/template.tpl.html',
        'link': function(scope, element, attrs,xmppController) {
            console.log("login",arguments);
            scope.xmpp=xmppController.xmpp;
            scope.openchat=function(jid){
                console.log("opnechat",jid);
                scope.onopenchat(jid);
            };
        }
    };
});
