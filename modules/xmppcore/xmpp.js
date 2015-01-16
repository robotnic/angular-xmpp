/*
factory:XmppCore
controller:Roster
*/

angular.module('XmppCore', ['mgcrea.ngStrap','luegg.directives'])



    .factory("Xmpp",function(){
        console.log("XMPP init");
        var socket = new Primus("https://laos.buddycloud.com");
        //var socket = new Primus("http://localhost:3000");
        var api={
            jid:null,
            socket:socket,
            login:function(username,password,register){
                    console.log("try to login",username,password,register);
                    if(username.indexOf("@")==-1){
                        var jid=username + '@laos.buddycloud.com';
                    }else{
                        var jid=username;
                    };
                    api.jid=jid;
                    api.socket.send('xmpp.login', {
                        jid: jid,
                        password: password,
                        register: register
                    });
            },
            logout:function(){
                    socket.send(
                        'xmpp.logout',
                        {},
                        function(error, data) {"logout", console.log(error, data) }
                    )

            },
            getOwnerFromNode:function(node){
                    var n = node.indexOf('@');
                    var name=node.substring(0,n);
                    var domain=node.substring(n+1);
                    n = name.lastIndexOf('/');
                    name=name.substring(n+1);

                    n = domain.indexOf('/');
                    domain=domain.substring(0,n);

                    var n = node.lastIndexOf('/');
                    var type = node.substring(n + 1);

                    var jid=name+"@"+domain;
                    return {name:name,domain:domain,jid:jid,type:type};

            },
            confirmFriend:function(node){
                console.log("confirm",jid); 
                socket.send( 'xmpp.presence.subscribe', { "to": jid })
                socket.send( 'xmpp.presence.subscribed', { "to": jid })
            },
            addFriend:function(jid){
                console.log("add",jid); 
                socket.send('xmpp.presence.subscribe', { "to": jid })
                socket.send( 'xmpp.presence.subscribed', { "to": jid })
            },
            removeFriend:function(jid){
                console.log("remove",jid);
                socket.send( 'xmpp.presence.unsubscribe', { "to": jid })
                socket.send( 'xmpp.presence.unsubscribed', { "to": jid })
            }






        }
        return api
    })




    .controller('XmppBasics', ['$scope', '$location', '$anchorScroll','Xmpp',
        function($scope, $location, $anchorScroll,Xmpp) {
            SCOPE = $scope;
            $scope.username = "seppl";
            $scope.password = "bbb";
            var socket=Xmpp.socket;

            //small chat window

            $scope.open = function(user) {
                console.log("open", user);
                user.opened = "max";
            };
            $scope.close = function(user) {
                user.opened = false;
            }
            $scope.minify = function(user) {
                user.opened = "min";
                console.log("min", user);
            }

            $scope.allow=function(user){
                confirmFriend(user.jid.user+"@"+user.jid.domain);
                console.log(user);

            }
            $scope.addjid=function(){
                addFriend($scope.newjid);
            }

           
            //send chat message 
            $scope.send = function(user,event) {
                console.log(arguments,this);
                var jid=user.jid.user+"@"+user.jid.domain;
                var message = {
                    to: jid,
                    content: user.newtext
                }
                if (!user.messages) user.messages = [];
                user.messages.push(message);
                socket.send('xmpp.chat.message', message);
                user.newtext = "";
                return false;
            }




            // socket!!!!
            socket.on("open",function(){
                console.log("connected, ready for login");
                $scope.connection_open=true;
                $scope.$apply();
            });

            socket.on('end', function () {
                  console.log('Connection closed');
                $scope.connected=false;
            });

            /* 
            $scope.login=function(){
                    console.log("try to login",$scope.username,$scope.password,$scope.register);
                    socket.send('xmpp.login', {
                        jid: $scope.username + '@laos.buddycloud.com',
                        password: $scope.password,
                        register: $scope.register
                    });
            }
            */

            $scope.login=function(){
                Xmpp.login($scope.username,$scope.password,$scope.register);
            }
           

            socket.on('xmpp.disconnect', function() {
                $scope.connected=false;
            });
            //connection established
            socket.on('xmpp.connection', function(data) {
                console.log("connect",data);
                $scope.jid=data.jid;
                $scope.connected=true;

                //vCard - not working
                socket.send('xmpp.vcard.get', {}, function(error, data) {
                    consle.log(error, data);
                })


                //receive chat messages

                socket.on('xmpp.chat.message', function(data) {
                    for (var i = 0; i < $scope.roster.length; i++) {
                        if ($scope.roster[i].jid.user == data.from.user) {
                            if (!$scope.roster[i].messages) $scope.roster[i].messages = [];
                            $scope.roster[i].messages.push(data);
                        }
                    }
                    $scope.$apply();
                });


                //presence handling
                socket.on('xmpp.presence', function(data) {
                    for (var i = 0; i < $scope.roster.length; i++) {
                        if ($scope.roster[i].jid.user == data.from.user) {  //domain missing you fixit!!
                            console.log(data);
                            if (data.status) {
                                status = data.status;
                            } else {
                                status = "";
                            }
                            $scope.roster[i].presence = {
                                status: status
                            }
                        }
                    }
                    $scope.$apply();
                });



//3:::{"type":0,"data":["xmpp.roster.push",{"jid":{"domain":"laos.buddycloud.com","user":"bill"},"subscription":"none","name":"bill"}]}

                socket.on('xmpp.roster.push', function(data) {
                    for (var i = 0; i < $scope.roster.length; i++) {
                        if ($scope.roster[i].jid.user == data.jid.user) {   //domain missing you fixit!!
                                $scope.roster[i]=data;
                        }
                    }
                    $scope.$apply();
                });






                //ask for roster
                socket.send(
                    'xmpp.roster.get', {},
                    function(error, data) {
                        console.log(data);
                        $scope.roster = data;
                        $scope.$apply();
                        socket.send(
                            'xmpp.presence', {
                                "show": "online",
                                "status": "I'm using xmpp-ftw!",
                                "priority": 10,
                            }
                        )

                    }
                )
            });

        }
    ])




