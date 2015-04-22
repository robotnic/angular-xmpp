        var SCOPE = null;

angular.module('XmppApp', [ 'templates-app', 'templates-common','XmppUI','btford.markdown','infinite-scroll','ngSanitize','ui.bootstrap','ui.router' ]) 

.controller('page', ['$scope','$http', function($scope,$http) {
    SCOPE=$scope;
    $scope.node="/user/lobby@laos.buddycloud.com/posts";
//        $scope.node="recent";
    $scope.setnode=function(node){
        console.log("3333",node);
        $scope.node=node;
    }
    $scope.initchat=function(chat){
        console.log("chat scope",chat);
        $scope.chat=chat;
    }
    $scope.openchat=function(jid){
        console.log("openchat",jid,$scope.chat);
        $scope.chat.openchat(jid);
    }
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

