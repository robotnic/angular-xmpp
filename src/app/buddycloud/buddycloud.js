// actions:
// Actions for items: reply to item, delete, update, block user, like, make a user a moderator, change a user from a being able to post to being read-only

/**
* Buddycloud module provides a timeline.
@module buddycloud
*/


var BC = null;
var BCAPI = null;
var LIKE = null;




angular.module('Buddycloud', [])

/**
Directive
@ngdoc directive
*/

.directive('buddycloud', function() {
    return {
        'require': '^xmpp',
        'restrict': 'E',
        'scope': {
            'search': '@',
            'node': '@',
            'jid': '=',
            'changenode': '&changenode',
            'oninit': '&oninit'
        },
        'transclude': false,
        'templateUrl': 'buddycloud/template.tpl.html',
        'controller': 'buddycloudController',
        'link': function(scope, element, attrs, xmppController) {

            //todo: startup needs cleanup

            console.log("link", attrs.node);
            scope.node = attrs.node;

            function watch() {
                scope.$watch("search", function() {
                    if (scope.search) {
                        scope.find(scope.search);
                    }
                });
                scope.$watch("node", function() {
                    console.log("node changed", scope.node);
                    if (!scope.data){
                         scope.data = {};
                    }
                    scope.data.tree = null;
                    scope.data.result = [];
                    scope.formdata = null;
                    scope.start = 0;
                    scope.loadFinished = false;
                    scope.loadItems();
                });
            }
            if (xmppController.xmpp.jid) {
                scope.init(xmppController.xmpp);
                watch();
            } else {
                console.log("scoep sonst", scope);
                xmppController.on("connected", function(s, status) {
                    console.log("connected buddycloud", xmppController, scope);
                    scope.init(xmppController.xmpp);

                    watch();
                });

            }

        }
    };
})




.factory('buddycloudFactory', ['$q',
    function($q) {


        return function(Xmpp) {

            /**
    waiting for incomming json stranzas
    @method watch
    */

            function watch() {
                var q = $q.defer();

                api.getAffiliations();
                console.log("asking for affiliations");

                Xmpp.socket.on('xmpp.buddycloud.push.item', function(data) {
                    console.log("==================", data.node);
                    if (!api.data.unread[data.node]) {
                        api.data.unread[data.node] = 0;
                    }
                    calcRights(data);
                    api.data.unread[data.node]++;
                    console.log(api.data.unread);

                    if (data.node == api.data.currentnode || api.data.currentnode == 'recent') {
                        var ar = data.id.split(",");
                        var id = ar[ar.length - 1];
                        console.log("id", id);
                        data.entry.atom.author.image = data.entry.atom.author.name.split("@")[0];
                        if (data.entry["in-reply-to"]) {
                            var ref = data.entry["in-reply-to"].ref;
                            console.log("ref", ref);
                            if (!api.data.tree[ref].nodes) {
                                api.data.tree[ref].nodes = [];
                            }
                            api.data.tree[ref].nodes.push(data);
                        } else {
                            api.data.tree[id] = data;
                        }
                    }
                    console.log("notify");
                    q.notify();
                });
                Xmpp.socket.on('xmpp.buddycloud.push.retract', function(response) {
                    if (api.data.tree[response.id]) {
                        delete api.data.tree[response.id];
                    } else {
                        for (var t in api.data.tree) {
                            console.log(t, api.data.tree[t]);
                            if (api.data.tree[t].nodes) {
                                for (var i = 0; i < api.data.tree[t].nodes.length; i++) {
                                    var node = api.data.tree[t].nodes[i];
                                    var ar = node.id.split(",");
                                    var id = ar[ar.length - 1];
                                    if (id == response.id) {
                                        api.data.tree[t].nodes.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    q.notify();
                });



                Xmpp.socket.on('xmpp.buddycloud.push.subscription', function(data) {
                    console.log("sub", data);
                    addToNodeList(data.node);
                    api.getAffiliations().then(function() {
                        api.maketree(api.data.result);
                        api.data.rights = isSubscribed(data.node);
                        q.notify();
                    }, function(error) {
                        console.log(error);
                    });

                });
                Xmpp.socket.on("xmpp.pubsub.push.affiliation", function(data) {
                    console.log("affiliation changed");
                    q.notify();
                });
                Xmpp.socket.on("xmpp.buddycloud.push.affiliation", function(data) {
                    console.log("affiliation changed2");
                    q.notify();
                });

                Xmpp.socket.on("xmpp.buddycloud.push.configuration", function() {
                    api.getAffiliations().then(function() {
                        api.maketree(api.data.result);
                    });
                });
                return q.promise;
            }


            /**
        @method search
        */
            function search(text) {
                var q = $q.defer();
                console.log("====", text);
                var stanza = {
                    form: [{
                        "var": 'content',
                        "value": text
                    }]
                };
                Xmpp.socket.send(
                    'xmpp.buddycloud.search.do', stanza,
                    function(error, data) {
                        if (error) {
                            console.error(stanza, error);
                            //$scope.create(stanza.node);
                        } else {
                            console.log("search result:", data);
                            q.resolve(maketree(data.results));
                        }
                    }
                );
                return q.promise;
            }


            function rate(node, ref) {
                var ar = ref.split(",");
                var id = ar[ar.length - 1];
                var stanza = {
                    node: node,
                    "content": {
                        activity: {
                            target: {
                                id: id
                            },
                            verb: 'rated'

                        }
                    }
                };
                Xmpp.socket.send(
                    'xmpp.buddycloud.publish', stanza,
                    function(error, data) {
                        if (error) {
                            console.error(stanza, error);
                            //$scope.create(stanza.node);
                        } else {
                            console.log("Message rated.");
                        }
                    }
                );

            }
            /**
        @method Buddycloud publish
        */
            function publish(node, text, ref) {
                var q = $q.defer();
                var jid = Xmpp.jid;
                if (node == "recent") {
                    node = "/user/" + Xmpp.jid + "/posts";
                }
                if (ref) {
                    node = ref.substring(0, ref.lastIndexOf(","));
                    node = node.substring(node.lastIndexOf(",") + 1);
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
                    };
                }
                Xmpp.socket.send(
                    'xmpp.buddycloud.publish', stanza,
                    function(error, data) {
                        if (error) {
                            console.error(stanza.node, error);
                            //$scope.create(stanza.node);
                        } else {
                            console.log("Message sent.", data);
                            q.resolve(data);
                            //            rate(node,data.id);
                        }
                    }
                );
                console.log("promise", q.promise);
                return q.promise;
            }

            /**
        @method removeitem
        */
            function removeitem(ref, node) {
                console.log("delete", ref, node);
                var ar = ref.split(",");
                var id = ar[ar.length - 1];
                var stanza = {
                    node: node,
                    id: id
                };
                console.log(stanza);
                Xmpp.socket.send(
                    'xmpp.buddycloud.item.delete', stanza,
                    function(error, data) {
                        if (error) {
                            console.error(error);
                        } else {
                            console.log("deleted ", id, data);
                        }
                    });

            }
            /**
        @method calcRights
        @param item
        */
            function calcRights(item) {
                var write = false;
                var remove = false;
                if (api.data.affiliations[item.node]) {
                    var affiliation = api.data.affiliations[item.node].affiliation;
                    if (affiliation === "publisher" || affiliation === "owner" || affiliation === "moderator") {
                        write = true;
                    }
                    if (affiliation === "owner" || affiliation === "moderator") {
                        remove = true;
                    }
                }
                if (item.entry.atom.author.name == Xmpp.jid) {
                    remove = true;
                }
                item.rights = {
                    publish: write,
                    remove: remove,
                    update: remove
                };

            }

            /**
        @method maketree
        @param data   
        */
            function maketree(data) {
                var tree = {};
                if (!data) {
                    return tree;
                }
                for (var i = 0; i < data.length; i++) {

                    if (!data[i].entry.atom.author.name) {
                        data[i].entry.atom.author.name = "franz@.fehlerteufelcom";
                    }
                    //console.log("maketree",data[i].node,api.data.affiliations[data[i].node].affiliation);
                    calcRights(data[i]);
                    data[i].entry.atom.author.image = data[i].entry.atom.author.name.split("@")[0];
                    data[i].nodeowner = Xmpp.parseNodeString(data[i].node).jid;
                    var ar = data[i].entry.atom.id.split(",");
                    var id = ar.pop();

                    if (data[i].entry["in-reply-to"]) {
                        var ref = data[i].entry["in-reply-to"].ref;
                        var item = tree[ref];
                        if (item) {
                            if (!item.nodes) {
                                item.nodes = [];
                            }
                            var newitem = true;
                            for (var j = 0; j < item.nodes.length; j++) {
                                if (data[i].id == item.nodes[j].id) {
                                    newitem = false;
                                    break;
                                }
                            }
                            if (newitem) {
                                item.nodes.push(data[i]);
                            }
                        }
                    } else {
                        tree[id] = data[i];
                    }
                }
                console.log("the tree", tree);
                return tree;
            }

            /**
        @method makeNodeList
        */
            function makeNodeList(data) {
                api.data.nodes = [];
                for (var i = 0; i < data.length; i++) {
                    var nodeObj = Xmpp.parseNodeString(data[i].node);
                    if (nodeObj.type == 'posts') {
                        addToNodeList(data[i].node);
                    }
                }

            }

            /**
        @method addToNodeList
        */
            function addToNodeList(node) {
                console.log("%%",node);
                var name = Xmpp.parseNodeString(node).name;
                var jid = Xmpp.parseNodeString(node).jid;
                for (var i = 0; i < api.data.nodes.length; i++) {
                    if (api.data.nodes[i].node == node) {
                        return;
                    }
                }
                console.log("999999999",node);
                api.getAffiliations(node);
                api.data.nodes.push({
                    name: name,
                    node: node,
                    jid: jid
                });

            }

            function isSubscribed(node) {
                console.log("----------------", node);
                var subscribed = false;
                var publish = false;
                var config = false;
                if (api.data.affiliations[node]) {
                    var affiliation = api.data.affiliations[node].affiliation;
                    console.log("aFF", affiliation);

                    if (affiliation === "publisher" || affiliation === "owner" || affiliation === "moderator") {
                        publish = true;
                    }
                    if (affiliation === "owner" || affiliation === "moderator") {
                        config = true;
                    }

                }
                if (api.data.nodes) {
                    for (var i = 0; i < api.data.nodes.length; i++) {
                        if (api.data.nodes[i].node == node) {
                            subscribed = true;
                            break;
                        }
                    }
                }
                var rights = {
                    subscribed: subscribed,
                    publish: publish,
                    config: config

                };
                return rights;
            }


            var api = {
                data: {
                    unread: {},
                    nodes: [],
                    affiliations: {}
                },
                publish: function(node, text, ref) {
                    return publish(node, text, ref);
                },
                removeitem: function(ref, node) {
                    return removeitem(ref, node);
                },
                maketree: function(data) {
                    return maketree(data);
                },
                search: function(text) {
                    return search(text);
                },
                getNodeItems: function(node, start, max) {
                    var q = $q.defer();
                    var append = false;
                    console.log('Retrieving node items for ', node);
                    if (start === 0) {
                        api.data.rsm = null;
                    }
                    var rsm = {
                        max: max
                    };
                    if (api.data.rsm) {
                        rsm.after = api.data.rsm.last;
                        append = true; //concat result
                    }

                    //var node='/user/team@topics.buddycloud.org/posts';
                    Xmpp.socket.send(
                        'xmpp.buddycloud.retrieve', {
                            node: node,
                            rsm: rsm
                        },
                        function(error, data, rsm) {
                            if (error) {
                                q.reject(error);
                            } else {
                                if (append) {
                                    api.data.result = api.data.result.concat(data);
                                } else {
                                    api.data.result = data;
                                }

                                console.log("++++++++++", rsm);
                                api.data.tree = maketree(api.data.result);
                                api.data.rights = isSubscribed(node);
                                api.data.unread[node] = 0;
                                q.resolve(data);
                                api.data.rsm = rsm;
                                api.data.currentnode = node;
                            }
                        }
                    );
                    return q.promise;
                },
                getRecentItems: function(start, max) {
                    var q = $q.defer();
                    var append = false; //start new
                    console.log('Retrieving recent items');
                    if (start === 0) {
                        api.data.rsm = null;
                    }
                    var rsm = {
                        max: max
                    };
                    if (api.data.rsm) {
                        rsm.after = api.data.rsm.last;
                        append = true; //concat result
                    }
                    console.log(">>>", rsm);

                    Xmpp.socket.send(
                        'xmpp.buddycloud.items.recent', {
                            rsm: rsm
                        },
                        function(error, data, rsm) {
                            if (error) {
                                q.reject(error);
                            } else {
                                if (append) {
                                    api.data.result = api.data.result.concat(data);
                                } else {
                                    api.data.result = data;
                                }
                                console.log("++++++++++", rsm);
                                api.data.tree = maketree(api.data.result);
                                q.resolve(data);
                                api.data.rsm = rsm;
                                api.data.currentnode = "recent"; //not beautiful programming
                            }
                        }
                    );
                    return q.promise;

                },

                getConfig: function(node) {
                    var q = $q.defer();
                    Xmpp.socket.send(
                        'xmpp.buddycloud.config.get', {
                            "node": node
                        },
                        function(error, data) {
                            if (error) {
                                console.log(error);
                                q.reject(error);
                            } else {
                                q.resolve(data);
                            }
                        }
                    );
                    return q.promise;
                },
                setConfig: function(node, form) {
                    var q = $q.defer();
                    Xmpp.socket.send(
                        'xmpp.buddycloud.config.set', {
                            "node": node,
                            "form": form
                        },
                        function(error, data) {
                            if (error) {
                                console.log(error);
                                q.reject(error);
                            } else {
                                q.resolve(data);
                            }
                        }
                    );
                    return q.promise;
                },
                discover: function() {
                    var q = $q.defer();
                    Xmpp.socket.send(
                        'xmpp.buddycloud.discover', {},
                        function(error, data) {
                            if (error) {
                                console.log(error);
                                q.reject(error);
                            } else {
                                q.resolve(data);
                            }
                        }
                    );
                    return q.promise;
                },
                getSubscriptions: function() {
                    var q = $q.defer();
                    Xmpp.socket.send(
                        'xmpp.buddycloud.subscriptions', {},
                        function(error, data) {
                            if (error) {
                                console.log(error);
                                q.reject(error);
                            } else {
                                console.log("suscriptions", data);
                                makeNodeList(data);
                                q.resolve(data);

                            }
                        }
                    );
                    return q.promise;
                },
                getSubscribers: function(node) {
                    var q = $q.defer();
                    Xmpp.socket.send(
                        'xmpp.buddycloud.subscriptions', {
                            node: node,
                            owner:true
                            
                        },
                        function(error, data) {
                            if (error) {
                                console.log(error);
                                q.reject(error);
                            } else {
                                console.log("suscribers", data);
                                api.getAffiliations(node).then(function(data){
                                    api.data.subscribers=data;
                                });
                                q.resolve(data);

                            }
                        }
                    );
                    return q.promise;
                },
                getMySubscriptions: function() {
                    var q = $q.defer();
                    Xmpp.socket.send(
                        'xmpp.buddycloud.subscriptions', {
                        },
                        function(error, data) {
                            if (error) {
                                console.log(error);
                                q.reject(error);
                            } else {
                                console.log("my suscriptions", data);
                                api.getAffiliations().then(function(data){
                                    api.data.mysubscriptions=data;
                                });
                                q.resolve(data);

                            }
                        }
                    );
                    return q.promise;
                },
 

                getAffiliations: function(node) {
                    var q = $q.defer();
                    var request={};
                    if(node){
                        request.node=node;
                    }
                    Xmpp.socket.send(
                        'xmpp.buddycloud.affiliations', request,
                        function(error, data) {
                            console.log(">>affiliations<<",node,error,data);
                            if (error) {
                                console.log(error);
                                q.reject(error);
                            } else {
//                                api.data.affiliations = {};
                                for (var i = 0; i < data.length; i++) {
                                    api.data.affiliations[data[i].node] = data[i];
                                }
                                console.log("==========",api.data.affiliations);
                                q.resolve(data);

                            }
                        }
                    );
                    return q.promise;
                },
                presence: function() {
                    Xmpp.socket.send('xmpp.buddycloud.presence', {});
                },
                register : function() {
                    var q=$q.defer();
                     Xmpp.socket.send(
                        'xmpp.buddycloud.register', {},
                        function(error, data) {
                            if(error){
                                console.log(error);
                                q.reject(error);
                            }else{
                                q.resolve(data);
                            }
                        }
                    );
                    return q.promise;
                },

                //not working
                create: function(node) {
                    socket.send(
                        'xmpp.buddycloud.create', {
                            "node": node
                        },
                        function(error, data) {
                            console.log(error, data);
                        }
                    );
                    console.log("create node (not tested) " + node);
                },

                subscribe: function(node) {
                    var q = $q.defer();
                    Xmpp.socket.send(
                        'xmpp.buddycloud.subscribe', {
                            node: node
                        },
                        function(error, data) {
                            if (error) {
                                console.log(error);
                                q.reject(error);
                            } else {
                                addToNodeList(node);
                                api.data.rights = isSubscribed(node);
                                api.getSubscribers(node).then(function(){
                                    q.resolve(data);
                                });
                            }
                        }
                    );
                    return q.promise;
                },
                unsubscribe: function(node) {
                    var q = $q.defer();
                    Xmpp.socket.send(
                        'xmpp.buddycloud.unsubscribe', {
                            node: node
                        },
                        function(error, data) {
                            if (error) {
                                console.log(error);
                                q.reject(error);
                            } else {
                                for (var i = 0; i < api.data.nodes.length; i++) {
                                    if (api.data.nodes[i].node == node) {
                                        api.data.nodes.splice(i, 1);
                                        break;
                                    }
                                }
                                api.getAffiliations(node).then(function() {
                                    console.log("got affiliations");
                                    delete api.data.affiliations[node];
                                    api.maketree(api.data.result);
                                    api.data.rights = isSubscribed(node);
                                    api.getSubscribers(node).then(function(){
                                        q.resolve(data);
                                    });
                                }, function(error) {
                                    console.log(error);
                                });

                            }
                        }
                    );
                    return q.promise;
                },


                watch: function() {
                    return watch();
                }
            };
            BCAPI = api;
            return api;
        };
    }
])


//todo: put more to factory, controll is tool long

.controller('buddycloudController', ['$scope', 'buddycloudFactory',
    function($scope, BuddycloudFactory) {
        var buddycloudFactory = null;
        $scope.init = function(Xmpp) {
            console.log("connect");
            $scope.connected = true;
            $scope.jid = Xmpp.jid;
            buddycloudFactory = new BuddycloudFactory(Xmpp);
            buddycloudFactory.discover()
                .then(buddycloudFactory.register)
                .then(buddycloudFactory.getSubscriptions)
                .then(function(data) {
                    console.log("DURCH", data);
                    $scope.selectednode = {
                        node: "recent",
                        name: ""
                    };
                    $scope.startup(Xmpp);
                    $scope.loadItems();
                }, function(error) {
                    console.log(error);
                });


        };
        $scope.startup = function(Xmpp) {
            $scope.max = 25;
            $scope.start = 0;
            BC = $scope;
            var socket = Xmpp.socket;
            $scope.newitems = {};
            $scope.data = buddycloudFactory.data;
            $scope.me = Xmpp.me;


            //watch incoming events
            buddycloudFactory.watch().then(
                function() {
                    console.warn("should not happen");
                },
                function(error) {},
                function(notification) {
                    console.log("updated");
                } //render tick
            );

            console.log("+++buddycloud controller+++");
            $scope.connected = true;


            //presence
            //socket.send('xmpp.buddycloud.presence', {});
            buddycloudFactory.presence();
            $scope.oninit({scope:$scope});

            /**
            * @method getConfig
            */
            $scope.getConfig = function() {
                $scope.formerror = "";
                buddycloudFactory.getConfig($scope.node).then(function(data) {
                    $scope.formdata = {
                        fields: data
                    };
                }, function(error) {
                    $scope.formerror = error;
                });
            };
            /**
            * @method getConfig
            * @param form
            */
            $scope.setConfig = function(form) {
                $scope.formerror = "";
                buddycloudFactory.setConfig($scope.node, form).then(function(data) {
                    $scope.form = null;
                }, function(error) {
                    $scope.formerror = error;
                });
            };


            /**
            * @method opennode
            * @param jid
            */
            $scope.opennode = function(jid) {
                var user=null;
                if(typeof(jid)=="object"){
                    user = jid;
                }else{
                    user = Xmpp.parseJidString(jid);
                }
                console.log(jid);
                $scope.changenode({
                    node: "/user/" + user.user + "@" + user.domain + "/posts",
                    bc:$scope
                });
            };




            //Buddycloud timeline
            $scope.loadItems = function() {
                if (!$scope.loadFinished) {
                    if ($scope.node == "recent") { //tricky - fixit
                        $scope.getRecentItems();
                    } else {
                        console.log($scope.node);
                        $scope.getNodeItems($scope.node);
                        buddycloudFactory.getSubscribers($scope.node).then(function(data){
                            console.log(data);
                        });
                    }
                }
            };

            $scope.getNodeItems = function(node) {
                buddycloudFactory.getNodeItems(node, $scope.start, $scope.max).then(function(data) {
                    if (data.length === 0) {
                        $scope.loadFinished = true;
                    }
                });
                $scope.start += $scope.max;
            };


            //timeline all nodes
            $scope.getRecentItems = function() {
                buddycloudFactory.getRecentItems($scope.start, $scope.max).then(function(data) {
                    if (data.length === 0) {
                        $scope.loadFinished = true;
                    }
                });
                $scope.start += $scope.max;
            };


            /**
            /* @method find - find nodes
            /* @param searchtext
            */
            $scope.find = function(searchtext) {
                buddycloudFactory.search(searchtext).then(function(data) {
                    console.log(data, data.results);
                    $scope.data.tree = data;
                });
            };




            /**
            /* @method subscrive - subscribe to node
            */
            $scope.subscribe = function() {
                //fixit: optional parameter node whould be ok
                buddycloudFactory.subscribe($scope.node).then();
            };

            /**
            /* @method unsubscrive
            */
            $scope.unsubscribe = function() {
                buddycloudFactory.unsubscribe($scope.node).then();
            };

            /**
            /* @method addContact
            /* @param node
            */
            $scope.addContact = function(node) {
                var jid = Xmpp.parseNodeString(node).jid;
                Xmpp.addContact(jid);
            };

            /**
            /* @method removeContact
            /* @param node
            */
            $scope.removeContact = function(node) {
                var jid = Xmpp.parseNodeString(node).jid;
                Xmpp.removeFriend(jid);
            };


            //Buddycloud delete - not working on laos.buddycloud.com
            /**
            /* @method removeitem -publish item to node
            /* @param ref
            /* @param node
            */
            $scope.removeitem = function(ref, node) {
                console.log("delete", ref, node);
                buddycloudFactory.removeitem(ref, node);
            };


            /**
            /* @method publish - check if user is in contact list
            /* @param node
            */
            $scope.isContact = function(node) {
                return Xmpp.isContact(node);
            };

            /**
            /* @method publish -publish item to node
            */
            $scope.publish = function(ref) {
                var node = $scope.node;
                var text = "";

                if (ref) {
                    text = $scope.newitems[ref].value;
                    $scope.newitems[ref].status = "saving";
                } else {
                    text = $scope.newtopic.value;
                    $scope.newtopic.status = "saving";
                }
                buddycloudFactory.publish(node, text, ref).then(function() {
                    $scope.newtopic = "";
                    if (ref) {
                        $scope.newitems[ref].value = "";
                        $scope.newitems[ref].status = "saved";
                    } else {
                        $scope.newtopic.value = "";
                        $scope.newtopic.status = "saved";
                    }
                }, function(error) {
                    console.log(error);
                });
            };

            //for infinite scroll
            $scope.getMore = function() {
                $scope.loadItems();
            };

        };


    }
]);
