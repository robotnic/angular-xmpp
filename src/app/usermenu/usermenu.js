angular.module("Usermenu",[])
.directive("usermenu",function(){
  return {
        'require': '^xmpp',
        'restrict': 'A',
        'scope': {
            onopenchat:'&onopenchat'
        },
        'transclude': false,
        'templateUrl': 'usermenu/template.tpl.html',
        'link': function(scope, element, attrs,xmppController) {
            console.log("login",arguments);
            scope.xmpp=xmppController.xmpp;
            scope.defaultdomain=xmppController.defaultdomain;
            scope.logout=function(){
                console.log("logout");
                scope.xmpp.send("xmpp.logout");
                localStorage.removeItem("usernamepassword");
            };

        }
    };
});
