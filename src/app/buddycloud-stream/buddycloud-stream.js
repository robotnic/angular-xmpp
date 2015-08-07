/*jslint node: true */
//'use strict';


angular.module("BuddycloudStream",['btford.markdown','naif.base64','ngAnimate'])
.directive("buddycloudStream",function(){
    console.log("dir");
    return {
        'require': '^buddycloud',
        'templateUrl':function(elem,attrs) {
           return attrs.templateUrl || 'buddycloud-stream/template.tpl.html'
        },
        'restrict': 'E',
        'scope': {
            onnodechange:'&onnodechange'
        },
        'controller': 'streamController',
        'transclude': false,
        'link': function(scope, element, attrs,events) {
            scope.events=events;
            events.connect().then(function(bc){
                scope.bc=bc;
            });
            scope.reply=function(event,item,input){
                if(event.keyCode == 13){
                    item.reply(input.text);
                    input.text="";
                }
            };
            scope.loadMoreReplies=function(node,id,first){
                console.log(id,first);
                scope.bc.send("xmpp.buddycloud.items.replies",{node:node,id:id,rsm:{max:10,before:first}});
            }
            scope.setConfig=function(data){
                console.log("new config data",data);
                scope.bc.send("xmpp.buddycloud.config.set",{node:scope.bc.data.currentnode,form:data});

            };
            scope.opennode=function(node){
                console.log("node",node);
                scope.onnodechange(node);
            };
            scope.createNode=function(){
                scope.bc.createNode({
                    node:scope.bc.data.requested,
                    options:[{
                        "var": "name",
                        "label": "Channel name",
                        "value": "xxx"
                    }]
                }).then(function(){
                    scope.onnodechange({node:scope.bc.data.requested});
                });

            }

            /*
            Todo, put in factory
            */

            scope.addContact=function(jid){
                console.log("addcontact",jid);
                scope.bc.xmpp.send("xmpp.presence.subscribe",{to:jid});
                scope.bc.xmpp.send("xmpp.presence.subscribed",{to:jid});
            };
            scope.confirmContact=function(jid){
                console.log("addcontact",jid);
                scope.bc.xmpp.send("xmpp.presence.subscribed",{to:jid});
                scope.bc.xmpp.send("xmpp.presence.subscribe",{to:jid});
                scope.bc.xmpp.send("xmpp.presence",{to:jid});
            };
            scope.removeContact=function(jid){
                console.log("removecontact",jid);
                scope.bc.xmpp.send("xmpp.presence.unsubscribe",{to:jid});
                scope.bc.xmpp.send("xmpp.presence.unsubscribed",{to:jid});
                scope.bc.xmpp.send("xmpp.roster.remove",{jid:jid});
            };
            scope.readContact=function(){
                if(scope.bc && scope.bc.data && scope.bc.data.configobj){
                    var jid=scope.bc.data.configobj['pubsub#owner'];
                    if(jid ){
                        var user=jid.split("@")[0];
                        var domain=jid.split("@")[1];
                        for(var i=0;i<scope.bc.xmpp.data.roster.length;i++){
                            var item=scope.bc.xmpp.data.roster[i];
                            if(item.jid.user==user && item.jid.domain==domain){
                                if(item.subscription=='none'){
                                    if(item.ask=="subscribe"){
                                        return "ask";
                                    }
                                }else{
                                    return item.subscription;
                                }
                            }
                        }
                    }
                }
            };
            scope.media={};
/*
            scope.loadmore=function(){
                alert("very good");
            }
*/
        }
    };

})

.controller("streamController",function($scope,$http){
            $scope.$watch("media.upload",function(){
                if(!$scope.media.upload){
                    return;
                }
                var json={
                 "data": $scope.media.upload.base64,
                 "content-type": $scope.media.upload.filetype,
                 "filename": "image.png",
                 "title": "Juliet's prom pic",
                 "description": "Juliet's beautiful prom pic!"
                 };
                var me=$scope.bc.xmpp.data.me.jid;
                var jid=me.user+"@"+me.domain;
                var url="https://buddycloud.com/api/"+jid+"/media";
                $http({method:"POST",url:url,data:json}).then(function(response){
                    console.log(response.data);
                },function(error){
                    console.log("upload error",error);
                });
            });

});

