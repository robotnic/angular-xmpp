var SCOPE = null;



angular.module('MyApp', ['mgcrea.ngStrap','Buddycloud','XmppCore'])
    .controller('pagecontroller', ['$scope','Xmpp',
        function($scope,Xmpp) {
            $scope.nodes=[
                {name:"laos",node:"/user/laos@laos.buddycloud.com/posts" }
            ];
            $scope.unreadmessages=0;
            $scope.messages={};
            $scope.open=function(node){
                console.log(node);
                $scope.selectednode=node;
            }
            Xmpp.socket.on('xmpp.chat.message', function(data) {
                $scope.unreadmessages++;
                console.log("THE MESSAGE",data);
                var jid=data.from.user+"@"+data.from.domain;
                data.from.jid=jid;
                if(!$scope.messages[jid])$scope.messages[jid]=[];
                $scope.messages[jid].unshift(data);
                $scope.$apply();
                
            });
            Xmpp.socket.on('xmpp.buddycloud.push.subscription', function(data) {
                console.log("sub",data);
                var name=Xmpp.getOwnerFromNode(data.node).name;    
                console.log(name);
                $scope.addNode({
                    node:data.node,
                    name:name
                });
                $scope.$apply();
            });
            Xmpp.socket.on('xmpp.connection', function(data) {
                console.log("connect",data);
                $scope.jid=data.jid;

                 //discover Buddycloud - not in use
                Xmpp.socket.send(
                    'xmpp.buddycloud.discover', {},
                    function(error, data) {
                        console.log(error, data);
                        if (error) return console.error(error)


                        console.log('Discovered Buddycloud server at', data);
                        $scope.selectednode={
                            node:"recent",
                            name:""
                        }


                        console.log("ask subscriptions");
                        Xmpp.socket.send(
                            'xmpp.buddycloud.subscriptions', { },
                            function(error, data) { 
                                console.log("SUBSRIPTIONS",error, data,data.node) 
                                for(var i=0;i<data.length;i++){
                                    var node=data[i].node;
                                    var nodeObj=Xmpp.getOwnerFromNode(node);
                                    var type = nodeObj.type;
                                    var name=nodeObj.name;
                                    console.log(name,type,node);
                                    if(type=='posts'){
                                        $scope.addNode({
                                            name:name,
                                            node:node
                                        });
                                    }
                                }
                                $scope.$apply();
                            }
                        )


                });
            })
            $scope.addNode=function(node){
                for(var i=0;i<$scope.nodes.length;i++){
                    if($scope.nodes[i].node==node.node){
                        return;
                    }
                }
                $scope.nodes.push(node);

            }
            $scope.logout=function(jid){
                Xmpp.logout();
                $scope.connected=false;  //fake logout. Fixit!!
            }
            $scope.openchat=function(jid){
                console.log("Open Minichat not implemented (communicate to roster controller ?)",jid);
            }
        }
    ])




