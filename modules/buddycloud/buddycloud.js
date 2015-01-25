var BC = null;
var LIKE = null;


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




.factory('buddycloudFactory',function(Xmpp,$q){



    //Buddycloud publish
    function publish(node,text,ref) {
        
        var jid=Xmpp.jid;

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
            }
        }
        Xmpp.socket.send(
            'xmpp.buddycloud.publish', stanza,
            function(error, data) {
                if (error) {
                    console.error(stanza.node, error);
                    //$scope.create(stanza.node);
                } else {
                    console.log("Message sent.");
                }
            }
        );

    }

    function removeitem(ref, node) {
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


    function maketree (data) {
        console.log("maketree", data);
        var tree = {};
        if (!data) return tree;
        for (var i = 0; i < data.length; i++) {
            data[i].entry.atom.author.image = data[i].entry.atom.author.name.split("@")[0];
            data[i].nodeowner = Xmpp.parseNodeString(data[i].node).jid;
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





    var api={
        data:{},
        publish:function(node,text,ref){
            publish(node,text,ref);
        },
        removeitem:function(ref,node){
            removeitem(ref,node);
        },
        maketree:function(data){
            return maketree(data);
        },

        getNodeItems : function(node) {
            var q=$q.defer();
            console.log('Retrieving node items')
            //var node='/user/team@topics.buddycloud.org/posts';
            Xmpp.socket.send(
                'xmpp.buddycloud.retrieve', {
                    node: node,
                    rsm: {
                        max: 55
                    }
                },
                function(error, data) {
                    if(error){
                        q.reject(error);
                    }else{
                        api.data.tree = maketree(data);
                        q.resolve(data);
                    }
                }
            )
            return q.promise;
        },
        getRecentItems : function() {
            var q=$q.defer();
            console.log('Retrieving recent items')
            Xmpp.socket.send(
                'xmpp.buddycloud.items.recent', {
                    rsm: {
                        max: 55
                    }
                },
                function(error, data) {
                    if(error){
                        q.reject(error);
                    }else{
                        api.data.tree = maketree(data);
                        q.resolve(data);
                    }
                }
            )
            return q.promise;

        }


    }
    return api;
})


//todo: make factory, controll is tool long

.controller('buddycloudController', function($scope, Xmpp,buddycloudFactory) {
    BC = $scope;
    var socket = Xmpp.socket;
    $scope.newitems = {};
    $scope.data=buddycloudFactory.data;

    console.log("+++buddycloud controller+++");
    $scope.connected = true;
    //presence
    socket.send('xmpp.buddycloud.presence', {});

    $scope.getConfig = function() {
        $scope.formerror = "";
        socket.send(
            'xmpp.buddycloud.config.get', {
                "node": $scope.node
            },
            function(error, data) {
                console.log("xmpp.buddycloud.config.get", error, data)

                $scope.formdata ={fields: data};
                $scope.$apply();
            }
        )
    }
    $scope.setConfig = function(form) {
        $scope.formerror = "";
        socket.send(
            'xmpp.buddycloud.config.set', {
                "node": $scope.node,
                "form": form
            },
            function(error, data) {
                console.log(error, data)
                if (error) $scope.formerror = error;
                if (!error) $scope.form = null; //close
                $scope.$apply();
            }
        )
    }


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
        buddycloudFactory.getNodeItems(node).then(function(data){
            //$scope.$apply();
        })
    }


    $scope.getRecentItems = function() {
        buddycloudFactory.getRecentItems().then(function(data){
         //   $scope.$apply();
        });
    }




    $scope.maketree = function(data) {
        return buddycloudFactory.maketree(data);
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
                if (!$scope.data.tree[ref].nodes) $scope.data.tree[ref].nodes = [];
                $scope.data.tree[ref].nodes.push(data);
            } else {
                $scope.data.tree[id] = data;
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
        console.log("add", node);
        var jid = Xmpp.parseNodeString(node).jid;
        console.log(jid);
        Xmpp.addFriend(jid);
    }

    //remove friend
    $scope.removeFriend = function(node) {
        console.log("remove", node);
        var jid = Xmpp.parseNodeString(node).jid;
        console.log(jid);
        Xmpp.removeFriend(jid);
    }




    //Buddycloud delete - not working

    $scope.removeitem = function(ref, node) {
        console.log("delete", ref, node);
        buddycloudFactory.removeitem(ref,node);
    }



    //Buddycloud publish
    $scope.publish = function(ref) {
        var node = $scope.node;

        if (ref) {
            var text = $scope.newitems[ref];
            $scope.newitems[ref]=""
        } else {
            var text = $scope.newtopic;
            $scope.newtopic="";
        }
        buddycloudFactory.publish(node,text,ref);
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
