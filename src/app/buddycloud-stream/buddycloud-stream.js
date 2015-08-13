/*jslint node: true */
//'use strict';


angular.module("BuddycloudStream",['btford.markdown','naif.base64','ngAnimate','ngFileUpload'])
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

.controller("streamController",function($scope,Upload,$timeout){
    $scope.uploaded=[];
    $scope.content={
        media:[]
    };

    var baseUrl="https://demo.buddycloud.org/api/";
    $scope.$watch('files', function () {
        console.log($scope.files);
        if($scope.files){
            $scope.upload($scope.files);
        }
    });

    $scope.upload = function (files) {
        var cred=$scope.bc.xmpp.model.credentials.request;
        var uploadurl=baseUrl+cred.jid+"/media";
        console.log( uploadurl);
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    method:"POST",
                    headers : {
                        'Content-Type': file.type,
                        'Authorization':'Basic '+btoa(cred.jid+":"+cred.password)
                        //'Authorization':btoa("u9:nix")
                    },
                    url: uploadurl,
                    fileFormDataName:'data',
                    fileName: 'filename',
                    file: file
                }).progress(function (evt) {
                    console.log(evt);
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' , data);
                    //trick to really load the image - not really good
                    $scope.uploaded.push(data);
                    $scope.content.media.push(data.id);
                });
            }
        }
    };

});
