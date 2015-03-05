angular.module('XmppMessages', [])


.factory('XmppMessageFactory',['$q',function($q){
    return function(xmpp){
        function watch(q){
            //notify is used to apply changes (render html);

            xmpp.socket.on('xmpp.chat.message', function(message) {
                if(!message.delay){
                    message.receivetime=(new Date()).getTime();
                }
                message.from.jid=message.from.user+"@"+message.from.domain;
                console.log("message",message);
                if(message.state){
                    if(message.state=="composing"){
                        api.notifications.composing[message.from.jid]=true;
                    }
                    if(message.state=="paused"){
                        api.notifications.composing[message.from.jid]=false;
                    }
                }

                if(message.content){
                    message.unread=true;
                    api.items.push(message);

                    api.notifications.unreadmessages++;
                    api.notifications.messages[message.from.jid]=message;
                    if(!api.notifications.unread[message.from.jid]){
                        api.notifications.unread[message.from.jid]=0;
                    }
                    api.notifications.unread[message.from.jid]++;
                    api.notifications.composing[message.from.jid]=false;
                    console.log("boop");
                }
                q.notify(message);
            });
        }


        var api={
            items:[],
            notifications: {
                unreadmessages:0,
                unread:{},
                messages:{},
                composing:{}
            },
            watch:function(){
                return watch();
            },
            send:function(user, text, event) {
                var message = {
                    to: user.jid,
                    type: "chat",
                    content: user.newtext
                };
                api.items.push(message);
                xmpp.socket.send('xmpp.chat.message', message);
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

        };
        console.log(xmpp);
        watch(xmpp.q);
        MESSAGES=api;  //debug only;
        return api;
    };
}])

