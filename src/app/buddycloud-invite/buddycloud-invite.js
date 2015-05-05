/*jslint node: true */
//'use strict'; 

angular.module("BuddycloudInvite",[])
.directive("buddycloudInvite",function(){
    return {
        'require': '^buddycloud',
        'scope': {
        },
        'templateUrl': 'buddycloud-invite/template.tpl.html',
        'restrict': 'E',
        'transclude': false,
        'link': function(scope, element, attrs,events) {
            scope.events=events;
            events.connect().then(function(bc){
                scope.bc=bc;
            });
            scope.invite=function(jid){
                console.log("jid",jid);
                scope.bc.send(
                    'xmpp.buddycloud.subscription',
                    {
                        "node":          scope.bc.data.currentnode,
                        "jid":           jid,
                        "subscription" : "invited"
                    }
                )
            };
        }
    };

});

