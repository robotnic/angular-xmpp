

angular.module('Minichat', [
  'templates-app', 'templates-common','mgcrea.ngStrap','XmppUI','btford.markdown','tagged.directives.infiniteScroll'])
    .controller('pagecontroller', ['$scope','$rootScope','Xmpp',
        function($scope,$rootScope,Xmpp) {
            //$scope.host="https://laos.buddycloud.com";
            $scope.host="https://xmpp-ftw.jit.su/";

            Xmpp.connect($scope.host).then(function(){
                console.log("http connect");
                $scope.online=true;
                $scope.anonymouslogin();
            });
            Xmpp.socket.on('xmpp.connection', function(data) {
                console.log("xmpp online");
                $scope.connected=true;
                $scope.$apply();
            });
            console.log(Xmpp);
            $scope.anonymouslogin=function(){
                console.log("anonymous login");
                Xmpp.anonymouslogin();
            }


            console.log("--pagecontroller--")
            $scope.connected=false;
        }])


