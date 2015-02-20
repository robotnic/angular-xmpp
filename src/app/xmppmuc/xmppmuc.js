angular.module('XmppMuc', ['XmppCore', 'luegg.directives'])

/**
MUC
@module XmppMuc
*/

/**
@class  XmppMuc.directive
*/

.directive('xmppmuc', function() {
    return {
        'require': '^xmpp',
        'restrict': 'E',
        'scope': {
            room: "@"
        },
        'transclude': false,
        'templateUrl': 'xmppmuc/template.tpl.html',
        'controller': 'XmppUiMuc',
        'link': function(scope, element, attrs, xmppController) {
            console.log("muc",xmppController);
            if(xmppController.xmpp.jid){
                scope.init(xmppController.xmpp);
            }else{
                xmppController.on("connected",function(s,status){
                    console.log("connected muc",xmppController);
                    scope.init(xmppController.xmpp);
                });

            }
        }
    };
})

/**
@class  XmppMuc.factory
@memberOf XmppMuc
*/
.factory("MucFactory", [ '$q',
    function( $q) {
        return function(xmpp){
            console.log("the muc factory");

            /**
            receive incoming messages
            */
            function watch() {
                console.log("start watching muc");
                //notify is used to apply changes (render html);
                var q = $q.defer();
                xmpp.socket.on('xmpp.muc.subject', function(message) {
                    api.subject=message;
                });
                xmpp.socket.on('xmpp.muc.message', function(message) {
                    if (!message.delay) {
                        message.receivetime = (new Date()).getTime();
                    }
                    api.messages.push(message);
                    q.notify();
                });
                xmpp.socket.on('xmpp.muc.roster', function(item) {

                    console.log("roster", item);
                    var found = false;
                    for (var i = 0; i < api.roster.length; i++) {
                        if (api.roster[i].nick == item.nick) {
                            found = true;
                            if (item.status == 'unavailable' || item.role == 'none') {
                                //user leaves chat
                                api.roster.splice(i, 1);
                            } else {
                                //user changed
                                for (var r in api.roster[i]) {
                                    api.roster[i][r] = item[r];
                                }
                            }
                            break;
                        }
                    }
                    if (!found) {
                        //new user
                        api.roster.push(item);
                    }
                    q.notify();
                });
                return q.promise;
            }

            var api = {
                messages: [],
                roster: [],
                room: null,
                subject: "leer",
                join: function(room, nick) {
                    api.room = room;
                    xmpp.socket.send(
                        'xmpp.muc.join', {
                            "room": room,
                            "nick": nick
                        },
                        function(error, data) {
                            console.log("muc answer", error, data);
                            api.getSubject(api.room);
                        }
                    );
                },
                /**
                @method send
                */
                send: function(message) {
                    xmpp.socket.send(
                        'xmpp.muc.message', {
                            "room": api.room,
                            "content": message
                        },
                        function(error, data) {
                            console.log("muc send", error, data);
                        }

                    );
                },
                /**
                @method getConfig
                */
                getConfig: function(message) {
                    var q = $q.defer();
                    xmpp.socket.send(
                        'xmpp.muc.room.config.get', {
                            "room": api.room
                        },
                        function(error, data) {
                            console.log("MUC config", error, data);
                            if (error){
                                 q.reject(error);
                            }
                            if (data){
                                 q.resolve(data);
                            }
                        }
                    );
                    return q.promise;
                },
                /**
                @method setConfig
                */

                setConfig: function(formdata) {
                    xmpp.socket.send(
                        'xmpp.muc.room.config.set', {
                            "room": api.room,
                            "form": formdata
                        },
                        function(error, data) {
                            console.log(error, data);
                        }
                    );
                },
                getRegister: function() {
                    var q = $q.defer();
                    xmpp.socket.send(
                        'xmpp.muc.register.info', {
                            "room": api.room
                        },
                        function(error, data) {
                            console.log("REGISTER config", error, data);
                            if (error){
                                 q.reject(error);
                            }
                            if (data){
                                 q.resolve(data);
                            }
                        }
                    );
                    return q.promise;

                },
                getSubject:function(room){
                    console.log("getSubject",room);
                    var q = $q.defer();
                    xmpp.socket.send(
                        'xmpp.muc.subject', {
                            "subject": "nix nixn nixn  nix"
                        },
                        function(error, data) {
                            console.log("-----------SUBJECT config", error, data);
                            if (error){
                                 q.reject(error);
                            }
                            if (data){
                                 q.resolve(data);
                            }
                        }
                    );
                    return q.promise;


                },
                getRoleMembers: function(role) {
                    xmpp.socket.send(
                        'xmpp.muc.role.get', {
                            "room": api.room,
                            "role": role
                        },
                        function(error, data) {
                            console.log("MUC admins", error, data);
                        }
                    );
                },
                watch: function() {
                    return watch();
                }
            };
            console.log("returning api", api);
            return api;

        }
    }
])


.controller('XmppUiMuc', ['$scope', '$rootScope',  'MucFactory',
    function($scope, $rootScope, MucFactory) {
        $scope.init=function(xmpp){
            $scope.chatwindows = [];
            $scope.muc = new MucFactory(xmpp);
            $scope.messages = $scope.muc.messages;
            $scope.roster = $scope.muc.roster;
            console.log("muc", $scope.muc);

            //use broadcast to open chat window
            $rootScope.$on("openmuc", function(data, jid) {
                $scope.muc.setRegister(formdata);
            });

            xmpp.socket.on("xmpp.muc.error", function(error) {
                $scope.muc.getRegister().then(function(data) {
                    $scope.formdata = data;
                });
            });

            $scope.join = function(nick) {
                console.log("join", nick);
                $scope.muc.join($scope.room, nick);
                $scope.joined = true;
                $scope.muc.watch().then(
                    function() {
                        console.log("muc watcher stoped");
                    },
                    function() {
                        console.log("muc watcher error");
                    },
                    function() {
                        //$apply is called
                    }

                );
            };
            $scope.send = function() {
                $scope.muc.send($scope.newmessage);
                $scope.newmessage = "";
            };
            $scope.configroom = function() {
                $scope.muc.getConfig().then(function(data) {
                    $scope.formdata = data;
                });
            };

            $scope.getrolemembers = function() {
                $scope.muc.getRoleMembers('participant');
            };
            $scope.save = function(formdata) {
                $scope.muc.setConfig(formdata);
            };
            $scope.open = function(item) {
                console.log(item);
                $rootScope.$broadcast('openchat', item.jid.user + "@" + item.jid.domain);

            };
        }
    }

]);
