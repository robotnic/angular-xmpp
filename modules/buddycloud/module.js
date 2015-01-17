var BC=null;
var LIKE=null;


angular.module('Buddycloud', [])



.directive('buddycloud', function() {
    return {
        'restrict': 'E',
        'scope': {
            'node': '@',
            'jid': '=',
            'changenode': '&changenode'
        },
        'transclude': false,
        'templateUrl': 'modules/buddycloud/template.html',
        'controller': 'buddycloudController',
        'link': function(scope, element, attrs) {
            console.log("link", attrs.node);
            scope.node = attrs.node;
            scope.$watch("node", function() {
                console.log("node changed");
                if (scope.node == "recent") {
                    scope.getRecentItems();
                } else {
                    scope.getNodeItems(scope.node);
                }
            });
        }
    };
})


.controller('buddycloudController', function($scope, Xmpp) {
    BC=$scope;
    var socket = Xmpp.socket;
    $scope.newitems = {};

    console.log("+++buddycloud controller+++");
    $scope.connected = true;
    //presence
    socket.send('xmpp.buddycloud.presence', {});


    $scope.opennode = function(name) {
        console.log(name);
        var localname = name.substring(0, name.indexOf("@"));
        var domain = name.substring(name.indexOf("@") + 1);
        console.log(localname, domain);

        var node = {
            node: "/user/" + localname + "@" + domain + "/posts",
            name: localname
        }
        $scope.changenode({
            node: node
        });
        console.log({
            node: node
        });
    }


    //not working
    $scope.create = function(node) {
        //var node = "/user/" + $scope.newnode + "@laos.buddycloud.com/posts";
        socket.send(
            'xmpp.buddycloud.create', {
                "node": node
            },
            function(error, data) {
                console.log(error, data)
            }
        );
        console.log("created");
    }


    //Buddycloud timeline

    $scope.getNodeItems = function(node) {
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
                console.log(error);
                //            $scope.items=data;
                $scope.tree = $scope.maketree(data);
            //    $scope.getLikes(data);
                $scope.$apply();
            }
        )

    }


    $scope.getRecentItems = function() {
        console.log('Retrieving recent items')
        //var node='/user/team@topics.buddycloud.org/posts';
        socket.send(
            'xmpp.buddycloud.items.recent', {
                rsm: {
                    max: 55
                }
            },
            function(error, data) {
                //            $scope.items=data;
                $scope.tree = $scope.maketree(data);
                //$scope.getLikes(data);
                    $scope.$apply();
            }
        )

    }




    $scope.maketree = function(data) {
        console.log("maketree", data);
        var tree = {};
        if (!data) return tree;
        for (var i = 0; i < data.length; i++) {
            data[i].entry.atom.author.image = data[i].entry.atom.author.name.split("@")[0];
            data[i].nodeowner = Xmpp.getOwnerFromNode(data[i].node).jid;
            var ar = data[i].entry.atom.id.split(",");
            var id = ar.pop();

            if (data[i].entry["in-reply-to"]) {
                var ref = data[i].entry["in-reply-to"].ref;
                var item = tree[ref];
                if (item) {
                    if (!item.nodes) item.nodes = [];
                    item.nodes.push(data[i]);
                }
            } else {
                tree[id] = data[i];
            }
        }
        console.log("the tree", tree);
        return tree;
    }






    //buddycloud message listener

    socket.on('xmpp.buddycloud.push.item', function(data) {
        console.log("==================", data.node);
        if (data.node == $scope.node || $scope.node == 'recent') {
            var ar = data.id.split(",");
            var id = ar[ar.length - 1];
            console.log("id", id);
            data.entry.atom.author.image = data.entry.atom.author.name.split("@")[0];
            if (data.entry["in-reply-to"]) {
                var ref = data.entry["in-reply-to"].ref;
                console.log("ref", ref);
                if (!$scope.tree[ref].nodes) $scope.tree[ref].nodes = [];
                $scope.tree[ref].nodes.push(data);
            } else {
                $scope.tree[id] = data;
            }
            $scope.$apply();
        }
    });
    socket.on('xmpp.buddycloud.item.delete', function(data) {
        console.log("deleting", arguments);
    });

    //subscribe to node

    $scope.subscribe = function() {
        socket.send(
            'xmpp.buddycloud.subscribe', {
                "node": $scope.node
            },
            function(error, data) {
                console.log(error, data)
            }
        )
    }

    //unsubscribe from node

    $scope.unsubscribe = function() {
        socket.send(
            'xmpp.buddycloud.unsubscribe', {
                "node": $scope.node
            },
            function(error, data) {
                console.log(error, data)
            }
        )
    }

    //add friend
    $scope.addFriend = function(node) {
        console.log("add",node);
        var jid = Xmpp.getOwnerFromNode(node).jid;
        console.log(jid);
        Xmpp.addFriend(jid);
    }

    //remove friend
    $scope.removeFriend = function(node) {
        console.log("remove",node);
        var jid = Xmpp.getOwnerFromNode(node).jid;
        console.log(jid);
        Xmpp.removeFriend(jid);
    }




    //Buddycloud delete - not working

    $scope.removeitem = function(ref,node) {
        console.log("delete", ref, node);
        var ar = ref.split(",");
        var id = ar[ar.length - 1];
        var stanza = {
            node: node,
            id: id
        };
        console.log(stanza);
        socket.send(
            'xmpp.buddycloud.item.delete', stanza,
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
        var node = $scope.node;
        if ($scope.node == "recent") {
            node = "/user/" + $scope.jid.user + "@" + $scope.jid.domain + "/posts";
        }
        if (ref) {
            node = ref.substring(0, ref.lastIndexOf(","));
            node = node.substring(node.lastIndexOf(",") + 1);
            console.log(">>>>>>>>>>>", node);
        }

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
                if (error){
                     console.error(stanza.node,error);
                    $scope.create(stanza.node); 
                }else {
                    $scope.newitems[ref] = "";
                    console.log("Message sent.");
                }
            }
        );







    }



})




.filter('toArray', function() {
    'use strict';

    return function(obj) {
        if (!(obj instanceof Object)) {
            return obj;
        }

        return Object.keys(obj).filter(function(key) {
            if (key.charAt(0) !== "$") {
                return key;
            }
        }).map(function(key) {
            return Object.defineProperty(obj[key], '$key', {
                __proto__: null,
                value: key
            });
        });
    };
});
