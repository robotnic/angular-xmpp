/*
factory:XmppCore
controller:Roster
*/

angular.module('XmppCore', ['mgcrea.ngStrap','luegg.directives'])



    .factory("Xmpp",function($q){
        console.log("XMPP init");
        var socket = new Primus("https://laos.buddycloud.com");
        //var socket = new Primus("http://localhost:3000");

        function watch(q){
            //roster change
            socket.on('xmpp.connection', function(data) {
                api.connected=true;
            });

            socket.on('xmpp.roster.push', function(data) {
                for (var i = 0; i < api.roster.length; i++) {
                    if (api.roster[i].jid.user == data.jid.user) {   //domain missing you fixit!!
                            api.roster[i]=data;
                    }
                }
                q.notify("roster");
            });

            //collect messages and add it to the roster
            socket.on('xmpp.chat.message', function(data) {
                if(api.roster){
                    for (var i = 0; i < api.roster.length; i++) {
                        if (api.roster[i].jid.user == data.from.user) {
                            if (!api.roster[i].messages) api.roster[i].messages = [];
                            api.roster[i].messages.push(data);
                        }
                    }
                    q.notify("message");
                }
            });

            //presence handling
            socket.on('xmpp.presence', function(data) {
                console.log("presence",data);
                if(api.roster){
                    for (var i = 0; i < api.roster.length; i++) {
                        if (api.roster[i].jid.user == data.from.user) {  //domain missing you fixit!!
                            console.log(data);
                            if (data.status) {
                                status = data.status;
                            } else {
                                status = "";
                            }
                            api.roster[i].presence = {
                                status: status
                            }
                        }
                    }
                    q.notify("presence");
                }
            });

        }


        var api={
            jid:null,
            connected:false,
            socket:socket,
            watch:function(){
                var q=$q.defer();
                watch(q);
                return q.promise; 
            },
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
                        },
                        function(error, data) {"logout", console.log(error, data) }
                    );
            },
            logout:function(){
                    socket.send(
                        'xmpp.logout',
                        {},
                        function(error, data) {"logout", console.log(error, data) }
                    )

            },
            send:function(user,message){
                if (!user.messages) user.messages = [];
                user.messages.push(message);
                socket.send('xmpp.chat.message', message);

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
            },
            getRoster:function(){
                var q=$q.defer();
                //ask for roster
                socket.send(
                    'xmpp.roster.get', {},
                    function(error, data) {
                        console.log(data);
                        api.roster = data;
                        q.resolve(data);

                    }
                )
                return q.promise;
            },
            setPresence:function(){
                    socket.send(
                        'xmpp.presence', {
                            "show": "online",
                            "status": "I'm using xmpp-ftw!",
                            "priority": 10,
                        }
                    )

            }






        }
        return api
    })




    .controller('XmppBasics', ['$scope','$rootScope', '$location', '$anchorScroll','Xmpp',
        function($scope, $rootScope,$location, $anchorScroll,Xmpp) {
            SCOPE = $scope;
            $scope.username = "seppl";
            $scope.password = "bbb";
            var socket=Xmpp.socket;
            $scope.roster=Xmpp.roster;

            //small chat window
            Xmpp.watch().then( function(){
                console.log("watch roster stopped");
            },
            function(){
                console.log("watch roster error");
            },
            function(){
                console.log("roster event");
//                $scope.$apply();
            });

            $rootScope.$on("openchat",function(data,user){
                console.log(user);
                for(var i=0;i<$scope.roster.length;i++){
                    var item=$scope.roster[i];
                    console.log(item,user);
                    if(item.jid.user==user.jid.user && item.jid.domain==user.jid.domain){
                            console.log("MATCH");
                            $scope.open(item);
                            return;
                    }
                }
            });

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
                Xmpp.send(user,message);
                user.newtext = "";
            }




            // socket!!!!
            socket.on("open",function(){
                console.log("connected, ready for login");
                if($scope.connected){
                    $scope.login();   //just poking with that
                }
                $scope.connection_open=true;
                $scope.$apply();
            });

            socket.on('end', function () {
                  console.log('Connection closed');
                $scope.connected=false;
            });


            $scope.login=function(){
                Xmpp.login($scope.username,$scope.password,$scope.register);
            }
           
            //not working
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
                Xmpp.setPresence();

/*
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

*/





                Xmpp.getRoster().then(function(data){
                    console.log("roster",data);
                    $scope.roster=data;
                });
            });

        }
    ])




