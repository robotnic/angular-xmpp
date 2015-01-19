var MUC=null;
angular.module('XmppMuc', ['XmppCore','luegg.directives'])

/*
Roster
*/

.directive('xmppmuc', function() {
    return {
        'restrict': 'E',
        'scope': {
            node:"@"
        },
        'transclude': false,
        'templateUrl': 'modules/xmppmuc/template.html',
        'controller': 'XmppUiMuc',
        'link': function(scope, element, attrs) {
            console.log("minichat");
        }
    };
})

.factory("MucFactory", function(Xmpp,$q){
        console.log("the muc factory");
        function watch(){ 
            console.log("start watching muc");
            var q=$q.defer();
            Xmpp.socket.on('xmpp.muc.message', function(message) {
                if(!message.delay){
                    message.receivetime=(new Date()).getTime();
                }
                api.messages.push(message);
                console.log("got message frm muc",message); 
                q.notify();
            });
            Xmpp.socket.on('xmpp.muc.roster', function(item) {
                console.log("roster",item);
                api.roster.push(item);
                q.notify();
            })
            return q.promise;
        }

        var api={
            messages:[],
            roster:[],
            room:null,
            join:function(room,nick){
                api.room=room;
                Xmpp.socket.send(
                    'xmpp.muc.join',
                    {
                        "room": room,
                        "nick": nick
                    },  
                    function(error,data){
                        console.log("muc answer",error,data);
                    }
                );
            },
            send:function(message){
                Xmpp.socket.send(
                    'xmpp.muc.message',
                    {
                        "room": api.room,
                        "content": message
                    },
                    function(error,data){
                        console.log("muc send",error,data);
                    }

                )
            },
            getConfig:function(message){
                var q=$q.defer();
                Xmpp.socket.send(
                    'xmpp.muc.room.config.get',
                    { "room": api.room },
                    function(error, data) { 
                        console.log("MUC config",error, data) 
                        if(error)q.reject(error);
                        if(data)q.resolve(data);
                    }
                )
                return q.promise
            },
            setConfig:function(formdata){
                 Xmpp.socket.send(
                    'xmpp.muc.room.config.set',
                    { 
                        "room": api.room, 
                        "form": formdata
                    },
                    function(error, data) { console.log(error, data) }
                )
            },
            getRegister:function(){
                var q=$q.defer();
                Xmpp.socket.send(
                    'xmpp.muc.register.info',
                    { "room": api.room },
                    function(error, data) { 
                        console.log("REGISTER config",error, data) 
                        if(error)q.reject(error);
                        if(data)q.resolve(data);
                    }
                )
                return q.promise

            },
            getRoleMembers:function(role){
                Xmpp.socket.send(
                    'xmpp.muc.role.get', 
                    {   
                        "room": api.room,
                        "role": role
                    }, 
                    function(error, data) { console.log("MUC admins",error, data) }
                )
            },
            watch:function(){
                return watch();
            }
        }
        console.log("returning api",api);
        return api;

    }
)


.controller('XmppUiMuc', ['$scope', '$rootScope', '$location', 'Xmpp','MucFactory',
    function($scope, $rootScope, $location,  Xmpp,MucFactory) {
        MUC=$scope;
        $scope.nick="eluag";
        $scope.chatwindows = [];
        $scope.messages = MucFactory.messages;
        $scope.roster = MucFactory.roster;
        $scope.muc=MucFactory;
        console.log("muc",MucFactory);

        //use broadcast to open chat window
        $rootScope.$on("openmuc", function(data, jid) {
            MucFactory.setRegister(formdata);
        });

        Xmpp.socket.on("xmpp.muc.error",function(error){
            MucFactory.getRegister().then(function(data){
                $scope.formdata=data;
            });
        })

        $scope.join=function(nick){
            console.log("join",nick);
            MucFactory.join($scope.node,nick);
            $scope.joined=true;
            MucFactory.watch().then(
                function(){console.log("muc watcher stoped")},
                function(){console.log("muc watcher error")},
                function(){
                    //$apply is called
                }

            );
        }
        $scope.send=function(){
            MucFactory.send($scope.newmessage);
            $scope.newmessage="";
        }
        $scope.configroom=function(){
            MucFactory.getConfig().then(function(data){
                $scope.formdata=data;
            });
        }

        $scope.getrolemembers=function(){
            MucFactory.getRoleMembers('participants');
        }
        $scope.save=function(formdata){
            MucFactory.setConfig(formdata);
        }
    }
])
