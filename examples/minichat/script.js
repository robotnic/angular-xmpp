

angular.module('Miniapp', [
  'templates-app', 'templates-common','mgcrea.ngStrap','XmppUI'])
    .controller('pagecontroller', ['$scope','$rootScope','Xmpp',
        function($scope,$rootScope,Xmpp) {
            //$scope.host="https://laos.buddycloud.com";
            $scope.host="https://xmpp-ftw.jit.su/";

            Xmpp.connect($scope.host).then(function(){
                console.log("verbindung steht");
                $scope.online=true;
            });
            Xmpp.socket.on('xmpp.connection', function(data) {
                $scope.connected=true;
                $scope.$apply();
            });

            console.log("--pagecontroller--")
            $scope.connected=false;
        }])


