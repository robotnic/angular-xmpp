
var MUC=null; //debug

angular.module('XmppMuc', [ 'luegg.directives'])


/**
MUC
@module XmppMuc
*/

/**
@class  XmppMuc.directive
*/


.directive('xmppmuc', function() {
    return {
        'restrict': 'E',
        'require': '^xmpp',
        'templateUrl':function(elem,attrs) {
           return attrs.templateUrl || 'xmpproster/template.tpl.html';
        },
        'scope': {
            room: "=",
            nick: "=",
            onopenchat: "&"
        },
        'transclude': false,
        'controller': 'XmppUiMuc',
        'link': function(scope, element, attrs,xmppController ) {
            scope.xmpp=xmppController.xmpp;

            console.log("muc",scope.xmpp);
            scope.xmpp.socket.on("xmpp.connection",function(event,status){
                scope.init(scope.xmpp);
            });
            console.log("connection status",scope.xmpp.model.connected);
            if(scope.xmpp.model.connected){
                scope.init(scope.xmpp);
            }

        }
    };
})


.controller('XmppUiMuc', ['$scope', '$rootScope',  'MucFactory',
    function($scope, $rootScope, MucFactory) {
        MUC=$scope;
        $scope.init=function(xmpp){
            $scope.muc = new MucFactory(xmpp);
    
            $scope.messages = $scope.muc.messages;
            $scope.roster = $scope.muc.roster;
            console.log("mucFactory", $scope.muc);

            //use broadcast to open chat window
            $rootScope.$on("openmuc", function(data, jid) {
                $scope.muc.setRegister(formdata);
            });

            xmpp.socket.on("xmpp.muc.error", function(error) {
                $scope.muc.getRegister().then(function(data) {
                    $scope.formdata = data;
                });
            });

            $scope.join = function(nick) {
                $scope.nick=nick;
                console.log("join", nick);
                $scope.muc.join($scope.room, nick);
                $scope.joined = true;
                $scope.muc.watch().then(
                    function() {
                        console.log("muc watcher stoped");
                    },
                    function() {
                        console.log("muc watcher error");
                    },
                    function() {
                        //$apply is called
                    }

                );
            };
            $scope.send = function() {
                console.log("send it away");
                $scope.muc.send($scope.newmessage);
                $scope.newmessage = "";
            };
            $scope.configroom = function() {
                $scope.muc.getConfig().then(function(data) {
                    $scope.formdata = data;
                });
            };

            $scope.getrolemembers = function() {
                $scope.muc.getRoleMembers('participant');
            };
            $scope.save = function(formdata) {
                $scope.muc.setConfig(formdata);
            };
/*
            $scope.open = function(item) {
                console.log(item);
                $rootScope.$broadcast('openchat', item.jid.user + "@" + item.jid.domain);

            };
*/
            $scope.open= function(item) {
                $scope.onopenchat(item);
            }
            $scope.join($scope.nick);
        }
    }

]);
