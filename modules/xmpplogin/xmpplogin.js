angular.module('XmppLogin', ['XmppCore'])

/*
Login

This modul needs cleanup. The session is not stable. Reconnect doesn't really work. I was happy to have a connection.
*/

.directive('xmpplogin', function() {
    return {
        'restrict': 'E',
        'scope': {},
        'transclude': false,
        'templateUrl': 'modules/xmpplogin/template.html',
        'controller': 'XmppLoginController',
        'link': function(scope, element, attrs) {
            console.log("minichat");
        }
    };
})



.controller('XmppLoginController', ['$scope', '$rootScope', '$location', '$anchorScroll', 'Xmpp',
    function($scope, $rootScope, $location, $anchorScroll, Xmpp) {
        SCOPE = $scope;
        $scope.username = "seppl";
        $scope.password = "bbb";
        var socket = Xmpp.socket;

        //Xmpp.connect();
        //watch roster - not really clear what it's doing

            console.log("after connect",Xmpp);
            Xmpp.watch().then(function() {
                console.log("watch roster stopped");
            },
            function() {
                console.log("watch roster error");
            },
            function() {
                console.log("roster event");
                //                $scope.$apply();
            });

            // socket!!!!
            /*
            socket.on("open", function() {
                console.log("connected, ready for login");
                if ($scope.connected) {
                    $scope.login(); //just poking with that
                }
                $scope.connection_open = true;
                $scope.$apply();
            });
            */

            socket.on('end', function() {
                console.log('Connection closed');
                $scope.connected = false;
            });


            $scope.login = function() {
                Xmpp.login($scope.username, $scope.password, $scope.register);
            }

            //not working
            socket.on('xmpp.disconnect', function() {
                $scope.connected = false;
            });
            //connection established

            socket.on('xmpp.connection', function(data) {
                console.log("connect", data);
                $scope.jid = data.jid;
                $scope.connected = true;
     
            });

        $scope.login = function() {
            Xmpp.login($scope.username, $scope.password, $scope.register);
        }

    }
])
