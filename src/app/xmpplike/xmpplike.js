var LIKE=null;

//to run this, the bot also must be running. 
//bot at: https://github.com/robotnic/likebot


angular.module('XmppLike', ['XmppCore'])

.directive('like', function() {
    console.log("like directive");
    return {
        'restrict': 'E',
        'scope': {
            'node': '@'
        },
        'transclude': false,
        'template': '<span ng-click="like(node)">like <span class="badge">{{likes[node]}}</span></span>',
        'controller': 'likeController',
        'link': function(scope, element, attrs) {
            scope.node = attrs.node;
            scope.$watch("node", function() {
                //console.log("like node changed",scope.node);
            });
        }
    };
})





.controller('likeController',['$scope', 'Xmpp','LikeFactory', function($scope, Xmpp,LikeFactory) {
    LIKE=$scope;
    $scope.likebot="likebot@laos.buddycloud.com";   //-----------------------the bot jid, should be in config
    var socket = Xmpp.socket;
    $scope.likerList = LikeFactory.likerList;
    $scope.likes = LikeFactory.likes;
    LikeFactory.getLikes($scope.node);

    $scope.like = function(id) {
        var text=JSON.stringify({type:"like",'id':id});
        var message={to:$scope.likebot,content:text};
        socket.send('xmpp.chat.message', message);
    };

    $scope.likers = function(id) {
        var text=JSON.stringify({type:'likers','id':id});
        var message={to:$scope.likebot,type:"chat",content:text};
        socket.send('xmpp.chat.message', message);
    };


}])


.factory("LikeFactory",['$q','Xmpp',function($q,Xmpp){

    var likebot="likebot@laos.buddycloud.com";
    var queue=[];
    var timeout=null;


    Xmpp.socket.on('xmpp.connection', function(data) {
        api.flush(queue);
    });
    Xmpp.socket.on('xmpp.chat.message', function(data) {
        if(likebot==data.from.user+"@"+data.from.domain){
            var o=JSON.parse(data.content);
            switch(o.type){

            case "like":
                var like=o;
                if(!api.likes[like.id]){
                    api.likes[like.id]=[];
                }
                api.likes[like.id]=like.count;
                break;
            case "likers":
                api.likerList[o.id]=o.list;
                break;
            case "list": 
                for(var c in o.counters){
                    api.likes[c]=o.counters[c];    //memory leak (caching)
                }
            }
            console.log("likes to apply",api.likes);
        }
    });
    var api={
        likerList:0,
        likes:{},
        getLikes:function(id){
            //maybe wait some ms to do more requests in one call
                if(!api.likes[id]){
                    queue.push(id);
                    if(Xmpp.connected){
                        if(!timeout){
                            timeout=setTimeout(function(){
                                api.flush();
                                timeout=null;
                            },100);
                        }
                    }
                }
        },
        flush:function(){
                var text=JSON.stringify({type:'list',ids:queue});
                var message={to:likebot,content:text};
                console.log("send queue",message);
                Xmpp.socket.send('xmpp.chat.message', message);
                queue=[];
        }


    };
    return api;



}])



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
