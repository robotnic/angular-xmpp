/*jslint node: true */
'use strict';

var STREAM=null;

angular.module("BuddycloudStream",['btford.markdown'])
.directive("buddycloudStream",function(){
    console.log("dir");
    return {
        'require': '^buddycloud',
        'templateUrl': 'buddycloud-stream/template.tpl.html',
        'restrict': 'E',
        'scope': {
            onnodechange:'&onnodechange'
        },
        'transclude': false,
        'link': function(scope, element, attrs,events) {
            scope.events=events;
            STREAM=scope;
            events.connect().then(function(bc){
                scope.bc=bc;
            });
            scope.reply=function(event,item,input){
                if(event.keyCode == 13){
                    item.reply(input.text);
                    input.text="";
                }
            }
            scope.setConfig=function(data){
                console.log("new config data",data);
                scope.bc.send("xmpp.buddycloud.config.set",{node:scope.bc.data.currentnode,form:data});

            }
            scope.opennode=function(node){
                console.log("node",node);
                scope.onnodechange(node);
            };
/*
            scope.loadmore=function(){
                alert("very good");
            }
*/
        }
    };

});

