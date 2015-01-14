var SCOPE = null;



angular.module('MyApp', ['mgcrea.ngStrap','Buddycloud','XmppCore'])
    .controller('pagecontroller', ['$scope',
        function($scope) {
            $scope.nodes=["u5","laos"]
            $scope.selectednode="u5";
            $scope.open=function(node){
                console.log(node);
                $scope.selectednode=node;
            }
        }
    ])


angular.module('XmppCore', ['mgcrea.ngStrap','luegg.directives'])



    .factory("Xmpp",function(){
        console.log("XMPP init");
        var socket = new Primus("https://laos.buddycloud.com");
        var api={
            socket:socket,
            login:function(username,password,register){
                    console.log("try to login",username,password,register);
                    api.socket.send('xmpp.login', {
                        jid: username + '@laos.buddycloud.com',
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
            $scope.username = "u5";
            $scope.password = "nix";
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

                socket.send(
                    'xmpp.presence.subscribed',
                    {
                        "to": user.jid.user+"@"+user.jid.domain
                    }
                )
            }
            $scope.addjid=function(){
                socket.send('xmpp.presence.subscribe', { "to": $scope.newjid })
            }

           
            //send chat message 
            $scope.send = function(user,event) {
                console.log(arguments,this);
                var message = {
                    to: user.name + "@laos.buddycloud.com",
                    content: user.newtext
                }
                if (!user.messages) user.messages = [];
                user.messages.push(message);
                socket.send('xmpp.chat.message', message);
                user.newtext = "";
                setTimeout(function() {
//                    $scope.gotoBottom(user.name);
                }, 10);
                return false;
            }

            //scroll chat window
            $scope.gotoBottom = function(name) {
                // set the location.hash to the id of
                // the element you wish to scroll to.
                $location.hash('bottom_' + name);

                // call $anchorScroll()
                $anchorScroll();
            };



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
                    $scope.gotoBottom(data.from.user);
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




