

angular.module('Minichat', [
  'templates-app', 'templates-common','mgcrea.ngStrap','XmppUI','btford.markdown','tagged.directives.infiniteScroll'])
    .controller('pagecontroller', ['$scope','$rootScope','Xmpp','buddycloudFactory',
        function($scope,$rootScope,Xmpp,buddycloudFactory) {
            //$scope.host="https://laos.buddycloud.com";
            $scope.host="https://xmpp-ftw.jit.su/";

            Xmpp.connect($scope.host).then(function(){
                console.log("verbindung steht");
                $scope.online=true;
            });
/*
            Xmpp.socket.on('xmpp.connection', function(data) {
                console.log("drin");
                $scope.connected=true;
                $scope.$apply();
            });
*/

                Xmpp.socket.on('xmpp.connection', function(data) {
                    console.log("connect",data);
                    $scope.connected=true;
                    $scope.jid=data.jid;
                    buddycloudFactory.discover()
                    .then(buddycloudFactory.register)
                    .then(buddycloudFactory.getSubscriptions)
                    .then(function(data){
                        console.log("DURCH",data);
                        $scope.selectednode={
                                node:"recent",
                                name:""
                        };
                    },function(error){
                        console.log(error);
                    });

                });



            /*
            console.log(Xmpp);
            $scope.anonymouslogin=function(){
                console.log("request");
                Xmpp.anonymouslogin();
            }
            */


            console.log("--pagecontroller--")
            $scope.connected=false;
        }])


