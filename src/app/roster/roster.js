angular.module('XmppRoster', ['AngularXmpp'])

/*
Roster
*/

.directive('xmpproster', function() {
    return {
        'require': '^xmpp',
        'restrict': 'E',
        'scope': {
        },
        'transclude': false,
        'templateUrl': 'roster/template.tpl.html',
        'link': function(scope, element, attrs,xmppController) {
            console.log("roster",xmppController);
            scope.xmpp=xmppController.xmpp;
            xmppController.on("connected",function(s,status){
                console.log("roster meldet sich",scope,arguments);
                scope.xmpp.send("xmpp.roster.get");
                //set presence
                //scope.xmpp.setPresence();
            });
        }
    };
});

