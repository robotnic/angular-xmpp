/*jslint node: true */
//'use strict';

angular.module("BuddycloudNodelist",[])
.directive("buddycloudNodelist",function(){
    console.log("dir");
    return {
        'require': '^buddycloud',
        'templateUrl':function(elem,attrs) {
           return attrs.templateUrl || 'buddycloud-nodelist/template.tpl.html';
        },

        'restrict': 'E',
        'scope': {
            onnodechange:'&onnodechange'
        },
        'transclude': false,
        'link': function(scope, element, attrs,events) {
            scope.events=events;
            events.connect().then(function(bc){
                scope.bc=bc;
            });
            scope.opennode=function(node){
                scope.onnodechange({node:node});
            }; 
            scope.save = function() {
                console.log(scope.form);
                var domain=scope.bc.xmpp.data.me.jid.domain;
                console.log(scope);
                var node='/user/' + scope.form[0].value + '@topics.'+domain+'/posts';
                scope.bc.createNode({
                    'node': node,
                    'options': scope.form
                }).then(function(){
                    scope.onnodechange({node:node});
                }).then(function(error){
                    console.log("create error",error);
                });
            };

            scope.form = [{
                "var": "name",
                "label": "Channel name",
                "value": ""
            }, {
                "var": "buddycloud#channel_type",
                "label": "Channel type",
                "value": "topic",
                "type": "fixed",
            }, {
                "var": "buddycloud#default_affiliation",
                "label":"Default affiliation",
                "value": "publisher",
                "type": "list-single",
                "options":  [{ label: "publisher", value: "publisher" }, { label: "member", value: "member" },{ label: "none", value: "none" },{ label: "outcast", value: "outcast" }]
            }, {
                "var": "pubsub#access_model",
                "label":"Access model",
                "value": "open",
                "type": "list-single",
                "options":  [{ label: "Open", value: "open" }, { label: "Local", value: "local" },{ label: "Authorize", value: "authorize" }]
            }, {
                "var": "pubsub#description",
                "label": "Description",
                "value": "I'm a stupid user and not able to write the description."
            }, {
                "var": "pubsub#title",
                "label": "Title",
                "value": "Not set"
            }];

        }
    };

});

