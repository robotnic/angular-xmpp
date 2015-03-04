angular.module('XmppMucFactory', ['XmppCoreFactory'])

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
                setUserRole:function(nick,role){
                    var q = $q.defer();
                    xmpp.socket.send(
                        'xmpp.muc.role.set', {
                            "room": api.data.room,
                            "nick": nick,
                            "role": role
                        },
                        function(error, data) {
                            console.log("-----------setUserRole", error, data);
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
                setUserAffiliation:function(jid,affiliation){
                    var q = $q.defer();
                    xmpp.socket.send(
                        'xmpp.muc.role.set', {
                            "room": api.data.room,
                            "jid": jid,
                            "affiliation":affiliation 
                        },
                        function(error, data) {
                            console.log("-----------setUserAffiliation", error, data);
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





                watch: function() {
                    return watch();
                }
            };
            console.log("returning api", api);
            return api;

        }
    }
])


