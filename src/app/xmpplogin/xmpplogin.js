
angular.module('XmppLogin', ['XmppCore'])

/*
Login

This modul needs cleanup. The session is not stable. Reconnect doesn't really work. I was happy to have a connection.
*/

.directive('xmpplogin', function() {
    return {
        'require': '^xmpp',
        'restrict': 'E',
        'scope': {},
        'transclude': false,
        'templateUrl': 'xmpplogin/template.tpl.html',
        'controller': 'XmppLoginController',
        'link': function(scope, element, attrs,xmppController) {
            console.log("login",arguments);
            scope.xmpp=xmppController.xmpp;
            console.log("have it",scope.xmpp);
            xmppController.on("connected",function(){
                    scope.connected=true; 
            });
        }
    };
})



.controller('XmppLoginController', ['$scope', 
    function($scope) {
        console.log("XmppLoginController",$scope.xmpp);
        $scope.login = function() {
            $scope.xmpp.login($scope.username, $scope.password, $scope.register,$scope.autologin);
        };
        $scope.username = "eva";
        $scope.password = "bbb";

/*
        SCOPE = $scope;
        $scope.username = "arni";
        $scope.password = "bbb";
        var socket = Xmpp.socket;

        //Xmpp.connect();
        //watch roster - not really clear what it's doing

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


            socket.on('end', function() {
                console.log('Connection closed');
                $scope.connected = false;
            });


            $scope.login = function() {
                Xmpp.login($scope.username, $scope.password, $scope.register,$scope.autologin);
            };

            //not working
            socket.on('xmpp.disconnect', function() {
                //$scope.connected = false;
                $scope.$apply();
            });
            //connection established

            socket.on('xmpp.connection', function(data) {
                console.log("connect", data);
                $scope.jid = data.jid;
                //$scope.connected = true;
     
            });

*/
    }
]);
