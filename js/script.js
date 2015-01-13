var SCOPE = null;

var sockets = [];


var node = '/user/u5@laos.buddycloud.com/posts';


angular.module('Xmpp', ['mgcrea.ngStrap'])
    .controller('Roster', ['$scope', '$location', '$anchorScroll',
        function($scope, $location, $anchorScroll) {
            SCOPE = $scope;
            $scope.username = "u5";
            $scope.messages = [];
            $scope.newitems = {};


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

           
            $scope.create = function() {
                socket.send(
                    'xmpp.buddycloud.create', {
                        "to": "laos.buddycloud.com",
                        "node": node,
                        "options": [{
                            "var": "buddycloud#channel_type",
                            "value": "personal"
                        }, {
                            "var": "pubsub#title",
                            "value": "Juliet's posts node"
                        }, {
                            "var": "pubsub#access_model",
                            "value": "open"
                        }]
                    },
                    function(error, data) {
                        console.log(error, data)
                    }
                );
                console.log("created");
            }
           
            //send chat message 
            $scope.send = function(user, text) {
                var message = {
                    to: user.name + "@laos.buddycloud.com",
                    content: user.newtext
                }
                if (!user.messages) user.messages = [];
                user.messages.push(message);
                socket.send('xmpp.chat.message', message);
                user.newtext = "";
                setTimeout(function() {
                    $scope.gotoBottom(user.name);
                }, 10);
            }

            //scroll chat window
            $scope.gotoBottom = function(name) {
                // set the location.hash to the id of
                // the element you wish to scroll to.
                $location.hash('bottom_' + name);

                // call $anchorScroll()
                $anchorScroll();
            };

            //convert buudycloud timeline to tree for easier rendering

            $scope.maketree = function(data) {
                console.log("maketree", data);
                var tree = {};
                if(!data)return tree;
                for (var i = 0; i < data.length; i++) {
                    console.log(data[i].entry);
                    data[i].entry.atom.author.image=data[i].entry.atom.author.name.split("@")[0];
                    var ar = data[i].entry.atom.id.split(",");
                    var id = ar.pop();
                    
                    console.log("ID", id);
                    if (data[i].entry["in-reply-to"]) {
                        console.log(data[i].entry["in-reply-to"].ref);
                        var ref = data[i].entry["in-reply-to"].ref;
                        var item = tree[ref];
                        console.log("ITEM", item, ref, tree);
                        if (item) {
                            if (!item.nodes) item.nodes = [];
                            item.nodes.push(data[i]);
                        }
                    } else {
                        console.log("kein relay", data[i].entry.atom.id, id);
                        tree[id] = data[i];
                    }
                }
                return tree;
            }



            // socket!!!!

            var socket = new Primus("https://laos.buddycloud.com");
            socket.on('open', function() {
                socket.send('xmpp.login', {
                    jid: $scope.username + '@laos.buddycloud.com',
                    password: 'nix',
                    register: true
                });
            });

            //connection established
            socket.on('xmpp.connection', function() {

                //presence
                socket.send('xmpp.buddycloud.presence', {});

                //vCard - not working
                socket.send('xmpp.vcard.get', {}, function(error, data) {
                    consle.log(error, data);
                })

                //discover Buddycloud - not in use
                socket.send(
                    'xmpp.buddycloud.discover', {},
                    function(error, data) {
                        console.log(error, data);
                        if (error) return console.error(error)
                        console.log('Discovered Buddycloud server at', data);
                        $scope.getNodeItems();
                    }
                );

                //subscribe to node
                socket.send(
                    'xmpp.buddycloud.subscribe', {
                        node: node
                    },
                    function(error, data) {
                        "subscrive", console.log(error, data)
                    }
                )

                //create node, not working
                $scope.create();

                
                //buddycloud message listener

                socket.on('xmpp.buddycloud.push.item', function(data) {
                    console.log("==================", data, data.id);
                    var ar = data.id.split(",");
                    var id = ar[ar.length - 1];
                    console.log("id", id);
                    if (data.entry["in-reply-to"]) {
                        var ref = data.entry["in-reply-to"].ref;
                        console.log("ref", ref);
                        if (!$scope.tree[ref].nodes) $scope.tree[ref].nodes = [];
                        $scope.tree[ref].nodes.push(data);
                    } else {
                        $scope.tree[id] = data;
                    }
                    $scope.$apply();
                });


                //Buddycloud delete - not working

                $scope.removeitem = function(ref) {
                    console.log("delete", ref);
                    var stanza = {
                        node: ref
                    };
                    socket.send(
                        'xmpp.buddycloud.delete', stanza,
                        function(error, data) {
                            if (error) console.error(error);
                            else {
                                console.log("deleted .", data);
                            }
                        });

                }

                //Buddycloud publish

                $scope.publish = function(ref) {
                    console.log(ref);
                    console.log("publishing: ", $scope.newmessage);
                    if (ref) {
                        var text = $scope.newitems[ref];
                    } else {
                        var text = $scope.newtopic;
                    }
                    var stanza = {
                        "node": node,
                        "content": {
                            "atom": {
                                "content": text
                            }
                        }
                    };
                    if (ref) {
                        stanza.content["in-reply-to"] = {
                            "ref": ref
                        }
                    }
                    socket.send(
                        'xmpp.buddycloud.publish', stanza,
                        function(error, data) {
                            if (error) console.error(error);
                            else {
                                $scope.newitems[ref] = "";
                                console.log("Message sent.");
                            }
                        }
                    );


                }


                //Buddycloud timeline

                $scope.getNodeItems = function() {
                    console.log('Retrieving node items')
                    //var node='/user/team@topics.buddycloud.org/posts';
                    socket.send(
                        'xmpp.buddycloud.retrieve', {
                            node: node,
                            rsm: {
                                max: 55
                            }
                        },
                        function(error, data) {
                            //            $scope.items=data;
                            $scope.tree = $scope.maketree(data);
                            console.log("TREE READY", $scope.tree);
                            console.log(error, data);
                            for (var i = 0; i < data.length; i++) {
                                console.log(data[i].entry, data[i].entry.atom.id, data[i].entry["in-reply-to"]);
                            }
                            $scope.$apply();
                        }
                    )

                }



                //receive chat messages

                socket.on('xmpp.chat.message', function(data) {
                    $scope.messages.push(data);
                    console.log("offline zeug", data);
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





