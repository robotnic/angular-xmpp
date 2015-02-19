/**
XmppCore
@module
@params 9
*/

var API=null;  //global for debugging

angular.module('XmppCore', [])



.factory("Xmpp",function($q){
    return function(host){
        console.log("XMPP init");
        //var socket = new Primus("https://xmpp-ftw.jit.su/");   //--------------- put to config
        //var socket = new Primus("https://laos.buddycloud.com");   //--------------- put to config
        //var socket = new Primus("http://localhost:3000");

    /**
    Listen to incoming json stanzas
    @method watch
    */    

        function watch(q){
            //roster change
            api.socket.on('xmpp.connection', function(data) {
                console.log("loged in");
                api.connected=true;
                q.notify(data);
            });

            api.socket.on('xmpp.roster.push', function(data) {
                for (var i = 0; i < api.roster.length; i++) {
                    if (api.roster[i].jid.user == data.jid.user) {   //domain missing you fixit!!
                            api.roster[i]=data;
                    }
                }
                q.notify("roster");
            });



            //presence handling
            api.socket.on('xmpp.presence', function(data) {
                console.log("presence",data);
                if(api.roster){
                    for (var i = 0; i < api.roster.length; i++) {
                        if (api.roster[i].jid.user == data.from.user) {  //domain missing you fixit!!
                            if (data.status) {
                                status = data.status;
                            } else {
                                status = "";
                            }
                            api.roster[i].presence = {
                                status: status
                            };
                            if(data.show=="offline"){
                                delete api.roster[i].presence;
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
                console.log("vor primus",host);
                api.socket = new Primus(host);
                api.socket.on("open", function() {
                    var jid=localStorage.getItem("jid");
                    var password=localStorage.getItem("password")
                    if(jid && password){
                        api.login(jid,password);
                    }
                    q.resolve();
                });
                return q.promise;
            },
            /**
            * @method login
            */
            login:function(username,password,register,autologin){
                    var q=$q.defer();
                    var jid=null;
                    //api.user = username;  //--------for avatar image
                    if(username.indexOf("@")==-1){
                        jid=username + '@laos.buddycloud.com';
                    }else{
                        jid=username;
                    }
                    api.jid=jid;
                    api.socket.send('xmpp.login', {
                            jid: jid,
                            password: password,
                            register: register
                        },
                        function(error, data) {
                            console.log(error, data);
                            if(error){
                                q.reject(error);
                            }else{
                                console.log("vor resolve");
                                api.jid=jid;
                                q.resolve(data);
                            }
                        }
                    );
                    if(autologin){
                        localStorage.setItem("jid",jid);
                        localStorage.setItem("password",password);
                    }
                    return q.promise;
            },
            anonymouslogin:function(){
                    var q=$q.defer();
                    var jid='laos.buddycloud.com';
                    api.socket.send('xmpp.login.anonymous', {
                            jid: jid,
                        },
                        function(error, data) {
                            console.log(error, data);
                            if(error){
                                q.reject(error);
                            }else{
                                q.resolve(data);
                            }
                        }
                    );
                    return q.promise;
            },




            /**
            * @method logout
            */
            logout:function(){
                    api.socket.send(
                        'xmpp.logout',
                        {},
                        function(error, data) {
                            console.log(error, data);
                        }
                    );

            },
            /**
            * @method send
            */
            send:function(user,message){
                if (!user.messages){
                     user.messages = [];
                }
                user.messages.push(message);
                api.socket.send('xmpp.chat.message', message);

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
                    return {name:name,domain:domain,jid:jid,type:type};

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
            /**
            * @method confirmContact
            */
            confirmContact:function(node){
                api.socket.send( 'xmpp.presence.subscribe', { "to": jid });
                api.socket.send( 'xmpp.presence.subscribed', { "to": jid });
            },
            /**
            * @method addContact
            */
            addContact:function(jid){
                api.socket.send('xmpp.presence.subscribe', { "to": jid });
                api.socket.send( 'xmpp.presence.subscribed', { "to": jid });
            },
            /**
            * @method removeContact
            */
            removeContact:function(jid){
                console.log("remove",jid);
                api.socket.send( 'xmpp.presence.unsubscribe', { "to": jid });
                api.socket.send( 'xmpp.presence.unsubscribed', { "to": jid });
            },
            isContact:function(node){
                return true;
            },
            /**
            * @method getRoster
            */
            getRoster:function(){
                var q=$q.defer();
                //ask for roster
                api.socket.send(
                    'xmpp.roster.get', {},
                    function(error, data) {

                        //replace content of roster array (but don't replace array);
                        api.roster.length=0;  //clear
                        for(var i=0;i<data.length;i++){
                            api.roster.push(data[i]);
                        }
                        q.resolve(data);

                    }
                );
                return q.promise;
            },
            /**
            * @method setPresence
            * @param {string} show - online status (online, available,...)
            * @param {string} status - free status text
            */
            setPresence:function(){
                    api.socket.send(
                        'xmpp.presence', {
                            "show": "online",
                            "status": "I'm using xmpp-ftw!",
                            "priority": 10
                        }
                    );

            }






        };
        API=api;
        console.log("---------",host);
        api.connect(host);
        return api;
    }
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
});
