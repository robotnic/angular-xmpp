angular.module('Minichat', ['XmppCore'])

/*
Roster
*/

.directive('xmppminichat', function() {
    return {
        'restrict': 'E',
        'scope': {
        },
        'transclude': false,
        'templateUrl': 'modules/minichat/template.html',
        'controller': 'XmppUiMinichat',
        'link': function(scope, element, attrs) {
            console.log("minichat");
        }
    };
})


    .controller('XmppUiMinichat', ['$scope','$rootScope', '$location', '$anchorScroll','Xmpp',
        function($scope, $rootScope,$location, $anchorScroll,Xmpp) {
            $scope.username=Xmpp.user;
            $scope.chatwindows=[];
            $scope.messages=[];
            console.log(Xmpp.jid,Xmpp.user);
            $rootScope.$on("openchat",function(data,jid){
                console.log("openchat",arguments);
                $scope.me=Xmpp.jid.substring(0,Xmpp.jid.indexOf("@"));
                var fromname=jid.substring(0,jid.indexOf("@"));
                for(var i=0;i<$scope.chatwindows.length;i++){
                    if( $scope.chatwindows[i].jid==jid){
                        console.log("already open",jid);
                        $scope.chatwindows[i].style="max";
                        break; 
                    }
                    $scope.chatwindows.push({jid:jid,style:"max",fromname:fromname});
                }
            });
            Xmpp.socket.on('xmpp.chat.message', function(message) {
                $scope.messages.push(message);
                $scope.$apply();
            })




            $scope.open = function(user) {
                console.log("open", user);
                user.style = "max";
            };
            $scope.close = function(user) {
                user.style = false;
            }
            $scope.minify = function(user) {
                user.style = "min";
                console.log("min", user);
            }
            //send chat message 
            $scope.send = function(user,text,event) {
                console.log(arguments,this);
                var message = {
                    to: user.jid,
                    type: "chat",
                    content: user.newtext
                }
                user.newtext = "";
                $scope.messages.push(message);
                Xmpp.socket.send('xmpp.chat.message', message);
                user.newtext = "";
            }

    }
])
