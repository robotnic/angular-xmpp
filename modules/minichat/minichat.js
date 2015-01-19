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


.controller('XmppUiMinichat', ['$scope', '$rootScope',  '$anchorScroll', 'Xmpp',
    function($scope, $rootScope,  $anchorScroll, Xmpp) {
        $scope.username = Xmpp.user;
        $scope.chatwindows = [];
        $scope.messages = [];

        //use broadcast to open chat window
        $rootScope.$on("openchat", function(data, jid) {
            console.log("openchat", arguments);
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

        //receiving messages from xmpp stream
        Xmpp.socket.on('xmpp.chat.message', function(message) {
            $scope.messages.push(message);
            $scope.$apply();
        })



        //big, small, close window
        $scope.makebig = function(user) {
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
        $scope.send = function(user, text, event) {
            console.log(arguments, this);
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
