/*jslint node: true */
//'use strict'; 

angular.module("BuddycloudAffiliations",[])
.directive("buddycloudAffiliations",function(){
    return {
        'require': '^buddycloud',
        'scope': {
            onnodechange:'&onnodechange',
            onopenchat:'&onopenchat'
        },
        'templateUrl': 'buddycloud-affiliations/template.tpl.html',
        'restrict': 'E',
        'transclude': false,
        'link': function(scope, element, attrs,events) {
            scope.events=events;
            events.connect().then(function(bc){
                scope.bc=bc;
                scope.bc.send('xmpp.buddycloud.affiliations', {node:scope.bc.data.currentnode});
            });
            scope.opennode=function(node){
                console.log("node",node);
                scope.onnodechange(node);
            };
            scope.openchat=function(jid){
                console.log("openchat",jid);
                scope.onopenchat({jid:jid});
            }; 
        }
    };

});

