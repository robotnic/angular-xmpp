/**
XmppCore
@module
@params 9
*/

var API=null;  //global for debugging

angular.module('XmppCoreFactory', [])



.factory("Xmpp",function($q){
    return function(host){
        console.log("New XMPP init");

        /**
        Listen to incoming json stanzas
        @method watch
        */    

        function watch(q){
            api.q=q;
            //roster change
            api.socket.on('xmpp.connection', function(data) {
                console.log("loged in",data);
                api.data.me=data;
                api.data.connected=true;
                q.notify("login");
            });
            api.socket.on('xmpp.logout', function(data) {
                api.data.me=null;
                api.connected=false;
                q.notify("logout");
            });

            api.socket.on('xmpp.roster.push', function(data) {
                var exists=false;
                for (var i = 0; i < api.data.roster.length; i++) {
                    if (api.data.roster[i].jid.user == data.jid.user) {   //domain missing you fixit!!
                            var exists=true;

                            if(data.subscription=="remove"){
                                api.data.roster.splice(i,1);
                            }else{
                                api.data.roster[i]=data;
                            }
                            break;
                    }
                }
                if(!exists){
                    api.data.roster.push(data);
                }
                q.notify("roster");
            });



            //presence handling
            api.socket.on('xmpp.presence', function(data) {
                console.log("xmpp.presence",arguments);
                var presence={
                    show:data.show,
                    status:data.status,
                    priority:data.priority,
                }
                if(api.data.roster){
                    for (var i = 0; i < api.data.roster.length; i++) {
                        if (api.data.roster[i].jid.user == data.from.user && api.data.roster[i].jid.domain == data.from.domain) {  
                            api.data.roster[i].presence = presence;
                            if(data.show=="offline"){
                                delete api.data.roster[i].presence;
                            }
                        }
                    }
                }
                if (api.data.me.jid.user == data.from.user && api.data.me.jid.domain == data.from.domain) {  
                    api.data.me.presence = presence;
                }
                q.notify("presence");
            });

            api.socket.on('xmpp.presence.subscribe', function(data) {
                console.log('-----------------------------------------xmpp.presence.subscribe',data);
            });
            api.socket.on('xmpp.presence.subscribed', function(data) {
                console.log('-----------------------------------------xmpp.presence.subscribed',data);
            });
        }

        function send(command,request){
            console.log("send",command,request);
            switch(command){
                case 'xmpp.login':
                    var q=$q.defer();
                    if(!request){
                        q.reject("missing parameters for login");
                    }
                    api.socket.send('xmpp.login', request);
                    api.socket.on('xmpp.connection', function(data) {
                        q.resolve(data);
                    });
                    return q.promise;
                    break;
                case 'xmpp.login.anonymous':
                    var q=$q.defer();
                    api.socket.send('xmpp.login.anoymouse');
                    api.socket.on('xmpp.connection', function(data) {
                        q.resolve(data);
                    });
                    return q.promise;
                    break;
                case 'xmpp.logout':
                    var q=$q.defer();
                    api.socket.send(
                        'xmpp.logout',
                        {},
                        function(error, data) {
                            if(error){
                                console.log(error);
                            }else{
                                api.data.me=null;
                                api.data.connected=false;
                                api.q.notify("logout");
                                q.resolve("logout");
                            }
                        }
                    );
                    return q.promise;
                    break;
                case 'xmpp.chat.message':
                    break;
                case 'xmpp.chat.receipt':
                    break;
                case 'xmpp.presence':
                    api.socket.send( 'xmpp.presence', request);
                    break;
                case 'xmpp.presence.subscribe':
                    api.socket.send( 'xmpp.presence.subscribe', request);
                    break;
                case 'xmpp.presence.subscribed':
                    console.log(request);
                    api.socket.send( 'xmpp.presence.subscribed', request);
                    break;
                case 'xmpp.presence.unsubscribe':
                        console.log(request);
                    api.socket.send( 'xmpp.presence.unsubscribe', request);
                    break;
                case 'xmpp.presence.unsubscribed':
                    api.socket.send( 'xmpp.presence.unsubscribed', request);
                    break;
                case 'xmpp.roster.get':
                    var q=$q.defer();
                    api.socket.send(
                        'xmpp.roster.get', {},

                        function(error, data) {

                            //replace content of roster array (but don't replace array);
                            api.data.roster.length=0;  //clear
                            for(var i=0;i<data.length;i++){
                               api.data.roster.push(data[i]);
                            }
                            if(api.q){
                                api.q.notify("roster");
                            }
                            q.resolve("roster");

                        }
                    );
                    return q.promise;

                    break;
                case 'xmpp.roster.add':
                    console.log("not implemented");
                    break;
                case 'xmpp.roster.remove':
                    var q=$q.defer();
                    api.socket.send( 'xmpp.roster.remove', request,
                    function(error, data) {
                        if(error){
                            console.log("error",error);
                        }else{
                            for(var i=0;i<api.data.roster.length;i++){
                                var item=api.data.roster[i];
                                if(item.subscription=="remove"){
                                        api.data.roster.splice(i,1);
                                        break;
                                }
                            }
                            api.q.notify("roster remove");
                            q.resolve("roster remove");
                        }
                    })
                    return q.promise;
                    break;
                case 'xmpp.roster.edit':
                    //no idea what this is for
                    break;

                default:console.log(command,"not implemented");
            }
        }

        

        var api={
            jid:null,
            //user:null,
            data:{
                connected:false,
                roster:[],
                me:null
            },
            socket:null,
            q:null,
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
                });
                return q.promise;
            },


    /**
            * @method parseNodeString
            */
            parseNodeString:function(node){  
                    var n = node.indexOf('@');
                    var name=node.substring(0,n);
                    var domain=node.substring(n+1);
                    n = name.lastIndexOf('/');
                    name=name.substring(n+1);

                    n = domain.indexOf('/');
                    if(n!==-1){
                        domain=domain.substring(0,n);
                    }

                    n = node.lastIndexOf('/');
                    var type = node.substring(n + 1);

                    var jid=name+"@"+domain;
                    return {name:name,user:name,domain:domain,jid:jid,type:type};

            },
            /**
            * @method parseJidString
            */
            parseJidString:function(jid){   
                var domain=null;
                var resource=null;
                var parts=jid.split("@");
                var user=parts[0];
                var domainresource=parts[1];
                var n = name.indexOf('/');
                if(n==-1){
                    domain=domainresource;
                }else{
                    domain=domainresource.substring(0,n);
                    resource=domainresource.substring(n);
                }
                return({user:user,domain:domain,resource:resource});

            },



            send:function(command,request){
                console.log(command,request);
                return send(command,request);
            }



        };
        API=api;
        console.log("---------",host);
        api.connect(host);
        return api;
    };
})





/*
To Array filter is hidden here
*/


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
})



