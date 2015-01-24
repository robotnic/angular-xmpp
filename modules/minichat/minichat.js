MESSAGES=null;
angular.module('Minichat', ['XmppCore','luegg.directives'])
//luegg.directives for scroll cha down

/*
Roster
*/

.directive('xmppminichat', function() {
    return {
        'restrict': 'E',
        'scope': {},
        'transclude': false,
        'templateUrl': 'modules/minichat/template.html',
        'controller': 'XmppUiMinichat',
        'link': function(scope, element, attrs) {
            console.log("minichat");
        }
    };
})

.factory('XmppMessage',function(Xmpp,$q){

    function watch(){
        console.log("start watching muc");
        //notify is used to apply changes (render html);
        var q=$q.defer();
        Xmpp.socket.on('xmpp.chat.message', function(message) {
            console.log("message",message);
            if(!message.delay){
                message.receivetime=(new Date()).getTime();
            }
            message.from.jid=message.from.user+"@"+message.from.domain;
            message.unread=true;
            api.messages.push(message);

            if(!message.delay){
                api.notifications.unreadmessages++;
                api.notifications.messages[message.from.jid]=message;
                if(!api.notifications.unread[message.from.jid]){
                    api.notifications.unread[message.from.jid]=0;
                }
                api.notifications.unread[message.from.jid]++;
                console.log("got message in factory",message);
            }
            q.notify(message);
        });
        return q.promise;
    }

    var api={
        messages:[],        
        notifications: {
            unreadmessages:0,
            unread:{},
            messages:{}
        },
        watch:function(){
            return watch();
        },
        send:function(user, text, event) {
            console.log(arguments, this);
            var message = {
                to: user.jid,
                type: "chat",
                content: user.newtext
            }
            api.messages.push(message);
            Xmpp.socket.send('xmpp.chat.message', message);
        },
        markread:function(jid){
            api.notifications.unread[jid]=0;
            api.notifications.messages[jid]=[];
            var sum=0;
            for(var m in api.notifications.unread){
               sum+=api.notifications.unread[m]; 
            }
            api.notifications.unreadmessages=sum;
        }

    }
    MESSAGES=api;  //debug only;
    return api;
})


.controller('XmppUiMinichat', ['$scope', '$rootScope',  '$anchorScroll', 'Xmpp','XmppMessage',
    function($scope, $rootScope,  $anchorScroll, Xmpp, XmppMessage) {
        $scope.username = Xmpp.user;
        $scope.chatwindows = [];
        $scope.messages = XmppMessage.messages;
        XmppMessage.watch().then(
            function(end){},
            function(error){console.log(error)},
            function(notify){
                console.log(notify);
                console.log("============",$scope.chatwindows,notify.from.jid);
                for(var i=0;i<$scope.chatwindows.length;i++){
                        console.log("for",i);
                        console.log($scope.chatwindows[i].jid,notify.from.jid); 
                        if($scope.chatwindows[i].jid==notify.from.jid){ 
                            XmppMessage.markread(notify.from.jid);
                        }
                }
            }
        );

        //use broadcast to open chat window
        $rootScope.$on("openchat", function(data, jid) {
            console.log("openchat", arguments);
            XmppMessage.markread(jid);
            $scope.me = Xmpp.jid.substring(0, Xmpp.jid.indexOf("@"));
            var fromname = jid.substring(0, jid.indexOf("@"));
            for (var i = 0; i < $scope.chatwindows.length; i++) {
                if ($scope.chatwindows[i].jid == jid) {
                    $scope.chatwindows[i].style = "max";
                    return;  //---window already open
                }
            }
            $scope.chatwindows.push({
                jid: jid,
                style: "max",
                name: fromname
            });
            console.log($scope.chatwindows);
        });


        //big, small, close window
        $scope.makebig = function(user) {
            console.log("open", user);
            user.style = "max";
        };
        $scope.close = function(user) {
            user.style = false;
            for(var i=0;i<$scope.chatwindows.length;i++){
                console.log($scope.chatwindows[i]);
                console.log($scope.chatwindows[i].jid,user.jid);
                if($scope.chatwindows[i].jid==user.jid){
                    $scope.chatwindows.splice(i,1);
                }
            }
        }
        $scope.minify = function(user) {
            user.style = "min";
            console.log("min", user);
        }

        //send chat message 
        $scope.send = function(user, text, event) {
            XmppMessage.send(user, text, event);
            user.newtext = "";
        }

    }
])
