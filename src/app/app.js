        var SCOPE = null;

angular.module('XmppApp', [ 'templates-app', 'templates-common','AngularXmpp','btford.markdown','infinite-scroll','ngSanitize','ui.bootstrap' ]) 

.controller('page', ['$scope','$rootScope','$http','$location', function($scope,$rootScope,$http,$location) {
    SCOPE=$scope;
    var node=$location.$$url;
    if(node){
        $scope.node=node;
    }else{
        $scope.node="/user/lobby@laos.buddycloud.com/posts";
    }
//        $scope.node="recent";
    $scope.setnode=function(node){
        console.log("3333",node);
        $scope.node=node;
        location.hash=node;
    }
    $scope.initchat=function(chat){
        console.log("chat scope",chat);
        $scope.chat=chat;
    }
    $scope.openchat=function(jid){
        console.log("openchat",jid,$scope.chat);
        $scope.chat.openchat(jid);
    }
    $rootScope.$on('$locationChangeSuccess', function (data) {
        console.log('$locationChangeSuccess changed!', new Date(),data);
        console.log("opening",$location,$location.$$url);
        var node=$location.$$url;
        if(node=="/recent")node="recent"
        if(node=="")node="recent"
        console.log("this node should open",node);
        $scope.node=node;
    });
/*
    $scope.search=function(text){
        console.log(text);
        return [{title:"eins"},{title:"zwei"}]
    }

    $scope.getLocation = function(val) {
        console.log(val);
        return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
          params: {
            address: val,
            sensor: false
          }
        }).then(function(response){
          return response.data.results.map(function(item){
            return item.formatted_address;
          });
        });
  };
*/
}]);

