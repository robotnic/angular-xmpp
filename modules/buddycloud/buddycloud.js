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
                console.log("node changed",scope.node);
                scope.data.tree=null;
                scope.formdata=null;
                if (scope.node == "recent") {
                    scope.getRecentItems();
                } else {
                    console.log(scope.node);
                    scope.getNodeItems(scope.node);
                }
            });
        }
    };
})




.factory('buddycloudFactory',function(Xmpp,$q){


    function watch(){
            var q=$q.defer();
            Xmpp.socket.on('xmpp.buddycloud.push.subscription', function(data) {
                console.log("sub",data);
                addToNodeList(data.node);
                /*
                var name=Xmpp.parseNodeString(data.node).name;
                console.log(name);
                api.data.nodes.push({
                    node:data.node,
                    name:name
                });
                */
                q.notify();

            });
            return q.pomise;
    }



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
        Xmpp.socket.send(
            'xmpp.buddycloud.item.delete', stanza,
            function(error, data) {
                if (error) console.error(error);
                else {
                    console.log("deleted ",id, data);
                }
            });

    }


    function maketree (data) {
        console.log("maketree", data);
        var tree = {};
        if (!data) return tree;
        for (var i = 0; i < data.length; i++) {
            
            if(!data[i].entry.atom.author.name)data[i].entry.atom.author.name="franz@.fehlerteufelcom"
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

    function makeNodeList(data){
            api.data.nodes=[];
            for(var i=0;i<data.length;i++){
                var nodeObj=Xmpp.parseNodeString(data[i].node);
                if(nodeObj.type=='posts'){
                    addToNodeList(data[i].node);
                }
            }

    }

    function addToNodeList(node){
        var name=Xmpp.parseNodeString(node).name;    
        for(var i=0;i<api.data.nodes.length;i++){
            if(api.data.nodes[i].node==node){
                return;
            }
        }
        api.data.nodes.push({name:name,node:node});

    }

    function isSubscribed(node){
        console.log("----------------",node);
        api.data.subscribed=false;
        for(var i=0;i<api.data.nodes.length;i++){
            if(api.data.nodes[i].node==node){
                api.data.subscribed=true;
                return true;
            }
        }
        return false;
    }


    var api={
        data:{
            unread:{}
        },
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
            console.log('Retrieving node items for ',node)
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
                        isSubscribed(node);
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

        },

        getConfig : function(node) {
            var q=$q.defer();
             Xmpp.socket.send(
                'xmpp.buddycloud.config.get', {
                    "node": node
                },
                function(error, data) {
                    if(error){
                        console.log(error);
                        q.reject(error);
                    }else{
                        q.resolve(data);
                    }
                }
            )
            return q.promise;
        },
        setConfig : function(node,form) {
            var q=$q.defer();
             Xmpp.socket.send(
                'xmpp.buddycloud.config.set', {
                    "node": node,
                    "form":form
                },
                function(error, data) {
                    if(error){
                        console.log(error);
                        q.reject(error);
                    }else{
                        q.resolve(data);
                    }
                }
            )
            return q.promise;
        },
        discover : function() {
            var q=$q.defer();
             Xmpp.socket.send(
                'xmpp.buddycloud.discover', {},
                function(error, data) {
                    if(error){
                        console.log(error);
                        q.reject(error);
                    }else{
                        q.resolve(data);
                    }
                }
            )
            return q.promise;
        },
        getSubscriptions : function() {
            var q=$q.defer();
             Xmpp.socket.send(
                'xmpp.buddycloud.subscriptions', {},
                function(error, data) {
                    if(error){
                        console.log(error);
                        q.reject(error);
                    }else{
                        console.log("suscriptions",data);
                        makeNodeList(data);
                        q.resolve(data);
    
                    }
                }
            )
            return q.promise;
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
            )
            return q.promise;
        },
        subscribe : function(node) {
            var q=$q.defer();
             Xmpp.socket.send(
                'xmpp.buddycloud.subscribe', {node:node},
                function(error, data) {
                    if(error){
                        console.log(error);
                        q.reject(error);
                    }else{
                        addToNodeList(node);
                        isSubscribed(node);
                        q.resolve(data);
                    }
                }
            )
            return q.promise;
        },
        unsubscribe : function(node) {
            var q=$q.defer();
             Xmpp.socket.send(
                'xmpp.buddycloud.unsubscribe', {node:node},
                function(error, data) {
                    if(error){
                        console.log(error);
                        q.reject(error);
                    }else{
                        for(var i=0;i<api.data.nodes.length;i++){
                            if(api.data.nodes[i].node==node){
                                api.data.nodes.splice(i,1);
                                break;
                            }
                        }
                        isSubscribed(node);
                        q.resolve(data);
                    }
                }
            )
            return q.promise;
        },
 
 
        watch:function(){
            return watch();
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
    buddycloudFactory.watch();

    console.log("+++buddycloud controller+++");
    $scope.connected = true;
    //presence
    socket.send('xmpp.buddycloud.presence', {});

    $scope.getConfig = function() {
        $scope.formerror = "";
        buddycloudFactory.getConfig($scope.node).then(function(data){
            $scope.formdata ={fields: data};
        },function(error){
            $scope.formerror=error;
        })
    }
    $scope.setConfig = function(form) {
        $scope.formerror = "";
        buddycloudFactory.setConfig($scope.node,form).then(function(data){
            $scope.form = null;
        },function(error){
            $scope.formerror=error;
        })
    }


    $scope.opennode = function(jid) {
        var user=Xmpp.parseJidString(jid);
        //first "node" is paramater name
        console.log("what is this?",{node: "/user/" + user.user + "@" + user.domain + "/posts" });
        //$scope.changenode({node: "/user/" + user.user + "@" + user.domain + "/posts" });
        $scope.changenode({node: "/user/" + user.user + "@" + user.domain + "/posts" });
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
        buddycloudFactory.getNodeItems(node).then(function(data){ })
    }


    $scope.getRecentItems = function() {
        buddycloudFactory.getRecentItems().then(function(data){ });
    }




    $scope.maketree = function(data) {
        return buddycloudFactory.maketree(data);
    }






    //buddycloud message listener. todo: move to factory

    socket.on('xmpp.buddycloud.push.item', function(data) {
        console.log("==================", data.node);
        if(!$scope.data.unread[data.node])$scope.data.unread[data.node]=0;
        $scope.data.unread[data.node]++;
        console.log($scope.data.unread);

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
    socket.on('xmpp.buddycloud.push.retract', function(response) {
        if($scope.data.tree[response.id]){
            delete $scope.data.tree[response.id]
        }else{
            for(var t in $scope.data.tree){
                console.log(t,$scope.data.tree[t]);
                if($scope.data.tree[t].nodes){
                    for(var i=0;i<$scope.data.tree[t].nodes.length;i++){
                        var node=$scope.data.tree[t].nodes[i];
                        var ar = node.id.split(",");
                        var id=ar[ar.length - 1];
                        if(id==response.id){
                            $scope.data.tree[t].nodes.splice(i,1);
                            break;
                        }
                    }
                }
            }
        }
        $scope.$apply();
    });

    //subscribe to node

    $scope.subscribe = function() {
        buddycloudFactory.subscribe($scope.node).then();
    }

    //unsubscribe from node

    $scope.unsubscribe = function() {
        buddycloudFactory.unsubscribe($scope.node).then();
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
