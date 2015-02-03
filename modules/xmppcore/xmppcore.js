/*
factory:XmppCore
*/

var API=null;  //global for debugging

angular.module('XmppCore', [])



.factory("Xmpp",function($q){
    console.log("XMPP init");
    //var socket = new Primus("https://xmpp-ftw.jit.su/");   //--------------- put to config
    //var socket = new Primus("https://laos.buddycloud.com");   //--------------- put to config
    //var socket = new Primus("http://localhost:3000");

    function watch(q){
        //roster change
        api.socket.on('xmpp.connection', function(data) {
            api.connected=true;
        });

        api.socket.on('xmpp.roster.push', function(data) {
            for (var i = 0; i < api.roster.length; i++) {
                if (api.roster[i].jid.user == data.jid.user) {   //domain missing you fixit!!
                        api.roster[i]=data;
                }
            }
            q.notify("roster");
        });


        /*
        //collect messages and add it to the roster
        socket.on('xmpp.chat.message', function(data) {
            if(api.roster){
                for (var i = 0; i < api.roster.length; i++) {
                    if (api.roster[i].jid.user == data.from.user) {
                        if (!api.roster[i].messages) api.roster[i].messages = [];
                        api.roster[i].messages.push(data);
                    }
                }
                q.notify("message");
            }
        });
        */

        //presence handling
        api.socket.on('xmpp.presence', function(data) {
            console.log("presence",data);
            if(api.roster){
                for (var i = 0; i < api.roster.length; i++) {
                    if (api.roster[i].jid.user == data.from.user) {  //domain missing you fixit!!
                        console.log(data);
                        if (data.status) {
                            status = data.status;
                        } else {
                            status = "";
                        }
                        api.roster[i].presence = {
                            status: status
                        }
                    }
                }
                q.notify("presence");
            }
        });

    }


    var api={
        jid:null,
        //user:null,
        connected:false,
        socket:null,
        roster:[],
        watch:function(){
            var q=$q.defer();
            watch(q);
            return q.promise; 
        },
        connect:function(host){
            var q=$q.defer();
            if(api.socket){
                q.resolve();
            }
            api.socket = new Primus(host);
            api.socket.on("open", function() {
                q.resolve();
            })
            return q.promise;
        },
        login:function(username,password,register){
                console.log("try to login",username,password,register);
                //api.user = username;  //--------for avatar image
                if(username.indexOf("@")==-1){
                    var jid=username + '@laos.buddycloud.com';
                }else{
                    var jid=username;
                };
                api.jid=jid;
                api.socket.send('xmpp.login', {
                        jid: jid,
                        password: password,
                        register: register
                    },
                    function(error, data) {"logout", console.log(error, data) }
                );
        },
        logout:function(){
                api.socket.send(
                    'xmpp.logout',
                    {},
                    function(error, data) {"logout", console.log(error, data) }
                )

        },
        send:function(user,message){
            if (!user.messages) user.messages = [];
            user.messages.push(message);
            api.socket.send('xmpp.chat.message', message);

        },
        parseNodeString:function(node){  
                var n = node.indexOf('@');
                var name=node.substring(0,n);
                var domain=node.substring(n+1);
                n = name.lastIndexOf('/');
                name=name.substring(n+1);

                n = domain.indexOf('/');
                domain=domain.substring(0,n);

                var n = node.lastIndexOf('/');
                var type = node.substring(n + 1);

                var jid=name+"@"+domain;
                return {name:name,domain:domain,jid:jid,type:type};

        },
        parseJidString:function(jid){   
            console.log(jid);
            var parts=jid.split("@");
            console.log(parts);
            var user=parts[0];
            var domainresource=parts[1];
            var n = name.indexOf('/');
            if(n==-1){
                var domain=domainresource;
            }else{
                var domain=domainresource.substring(0,n);
                var resource=domainresource.substring(n);
            }
            return({user:user,domain:domain,resource:resource});

        },
        confirmFriend:function(node){
            console.log("confirm",jid); 
            api.socket.send( 'xmpp.presence.subscribe', { "to": jid })
            api.socket.send( 'xmpp.presence.subscribed', { "to": jid })
        },
        addFriend:function(jid){
            console.log("add",jid); 
            api.socket.send('xmpp.presence.subscribe', { "to": jid })
            api.socket.send( 'xmpp.presence.subscribed', { "to": jid })
        },
        removeFriend:function(jid){
            console.log("remove",jid);
            api.socket.send( 'xmpp.presence.unsubscribe', { "to": jid })
            api.socket.send( 'xmpp.presence.unsubscribed', { "to": jid })
        },
        isContact:function(node){
            return true;
        },
        getRoster:function(){
            var q=$q.defer();
            //ask for roster
            api.socket.send(
                'xmpp.roster.get', {},
                function(error, data) {
                    console.log("ROSTER",data);

                    //replace content of roster array (but don't replace array);
                    api.roster.length=0;  //clear
                    for(var i=0;i<data.length;i++){
                        api.roster.push(data[i]);
                    }
                    q.resolve(data);

                }
            )
            return q.promise;
        },
        setPresence:function(){
                api.socket.send(
                    'xmpp.presence', {
                        "show": "online",
                        "status": "I'm using xmpp-ftw!",
                        "priority": 10,
                    }
                )

        }






    }
    API=api;
    return api
})


