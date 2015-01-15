var SCOPE = null;



angular.module('MyApp', ['mgcrea.ngStrap','Buddycloud','XmppCore'])
    .controller('pagecontroller', ['$scope','Xmpp',
        function($scope,Xmpp) {
            $scope.nodes=["u5","laos","cambodia","bugs","seppl"]
            $scope.selectednode="u5";
            $scope.open=function(node){
                console.log(node);
                $scope.selectednode=node;
            }
            Xmpp.socket.on('xmpp.connection', function(data) {
                console.log("connect",data);
                $scope.jid=data.jid;
            });
        }
    ])


angular.module('XmppCore', ['mgcrea.ngStrap','luegg.directives'])



    .factory("Xmpp",function(){
        console.log("XMPP init");
        var socket = new Primus("https://laos.buddycloud.com");
        //var socket = new Primus("http://localhost:3000");
        var api={
            socket:socket,
            login:function(username,password,register){
                    console.log("try to login",username,password,register);
                    if(username.indexOf("@")==-1){
                        var jid=username + '@laos.buddycloud.com';
                    }else{
                        var jid=username;
                    };
                    api.socket.send('xmpp.login', {
                        jid: jid,
                        password: password,
                        register: register
                    });
            }

        }
        return api
    })




    .controller('Roster', ['$scope', '$location', '$anchorScroll','Xmpp',
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
                console.log(user);

                socket.send( 'xmpp.presence.subscribed', { "to": user.jid.user+"@"+user.jid.domain })
            }
            $scope.addjid=function(){
                socket.send('xmpp.presence.subscribe', { "to": $scope.newjid })
                socket.send( 'xmpp.presence.subscribed', { "to": $scope.newjid })
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
                        if ($scope.roster[i].jid.user == data.from.user) {
                            console.log(data);
                            if (data.status) {
                                status = data.status;
                            } else {
                                status = "online";
                            }
                            $scope.roster[i].presence = {
                                status: status
                            }
                        }
                    }
                    $scope.$apply();
                });


                //ask for roster
                socket.send(
                    'xmpp.roster.get', {},
                    function(error, data) {
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




