var APP = null;



angular.module('MyApp', ['mgcrea.ngStrap','Buddycloud','XmppCore','XmppLike','XmppUI','XmppLogin','XmppMap','btford.markdown','Minichat','XmppMuc','XmppForm','leaflet-directive'])
    .controller('pagecontroller', ['$scope','$rootScope','Xmpp','XmppMessage','buddycloudFactory','$http',
        function($scope,$rootScope,Xmpp,XmppMessage,buddycloudFactory,$http) {
            APP=$scope;
            //$scope.host="http://localhost:3000";
            //$scope.host="https://xmpp-ftw.jit.su/";
            $scope.host="https://laos.buddycloud.com";
            $scope.excludejid="likebot@laos.buddycloud.com";  // ----------- not perfect solution, how to make bot post invisible?
            $scope.data=buddycloudFactory.data;

            $scope.roster=Xmpp.roster;
            $scope.nodes=[
                {name:"laos",node:"/user/laos@laos.buddycloud.com/posts" }
            ];
            
            $scope.messages=XmppMessage.messages;
            $scope.notifications=XmppMessage.notifications;

            $scope.friendRequests={};
            $scope.friendRequestsCount=0;
            $scope.open=function(node){
                console.log(node);
                $scope.selectednode=node;
            }

            $scope.tabs = [
              { "title": "Buddycloud" },
              { "title": "Groupchat" },
              { "title": "Develop" },
              {"title":"Map"}
            ];
            $scope.tabs.activeTab = 0;

            $scope.find=function(text){
    
                console.log(text);
                $http.get("https://laos.buddycloud.com/api/search?type=metadata&max=5&q="+text).then(function(data){
                        $scope.searchresult=data;
                        $scope.tabs.activeTab = 2;
                        console.log(data);
                    },function(error){
                        console.log(error);
                    }
                );
            }


            Xmpp.connect($scope.host).then(function(){
                $scope.online=true;
                Xmpp.socket.on('xmpp.connection', function(data) {
                    $scope.connected=true;
                });


                //message tool in navbar
                Xmpp.socket.on('xmpp.wtf.push', function(data) {
                    console.log(data);
                    alert(1);
                })

                //friend request
                //3:::{"type":0,"data":["xmpp.presence.subscribe",{"from":{"domain":"laos.buddycloud.com","user":"bill"}}]}

                Xmpp.socket.on('xmpp.presence.subscribe', function(data) {

                    console.log("Friend request",data,$scope.friendRequestsCount);
                    var jid=data.from.user+"@"+data.from.domain;
                    data.from.jid=jid;
                    if(!$scope.friendRequests[jid]){
                        $scope.friendRequests[jid]=data;
                        $scope.friendRequestsCount++;
                    }

                    $scope.$apply();
                })
                /*
                //subscribe, unsubscribe events (unsubsribe not firing bug)
                Xmpp.socket.on('xmpp.buddycloud.push.subscription', function(data) {
                    console.log("sub",data);
                    var name=Xmpp.parseNodeString(data.node).name;    
                    console.log(name);
                    $scope.addNode({
                        node:data.node,
                        name:name
                    });
                    $scope.$apply();
                });
                */

                //logged in
                Xmpp.socket.on('xmpp.connection', function(data) {
                    console.log("connect",data);
                    $scope.jid=data.jid;
                    buddycloudFactory.discover()
                    .then(buddycloudFactory.register)
                    .then(buddycloudFactory.getSubscriptions)
                    .then(function(data){
                        console.log("DURCH",data);
                        $scope.selectednode={
                                node:"recent",
                                name:""
                        }
                    },function(error){
                        console.log(error);
                    })

                    Xmpp.socket.on('xmpp.error', function (error) {
                        console.log('error', error)
                    })
                    Xmpp.socket.on('xmpp.error.client', function (error) {
                        console.log('client error', error)
                    })
                    Xmpp.socket.on('xmpp.muc.invite', function (data) {
                        console.log("muc invitation",data);
                    })
                })
            });

            $scope.addFriend=function(from){
                Xmpp.addFriend(from.user+"@"+from.domain);
            }
            $scope.logout=function(jid){
                Xmpp.logout();
                $scope.connected=false;  //fake logout. Fixit!!
            }
            $scope.openchat=function(jid){
                console.log("Open Minichat not implemented (communicate to roster controller ?)",jid);
                $rootScope.$broadcast('openchat',jid);
            }
        }
    ])




