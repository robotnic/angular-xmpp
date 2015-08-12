angular.module("BuddycloudMedia",[])
.directive("buddycloudMedia",function(){
  return {
        'require': '^buddycloud',
        'restrict': 'E',
        'scope':{
            metadata:"@" 
        },
        'controller': 'BuddycloudMediaController',
        'transclude': false,
        'templateUrl': 'buddycloud-media/template.tpl.html',
        'link': function(scope, element, attrs,xmppController) {
        }
    };
})
.controller("BuddycloudMediaController",function($scope,$http,$sce){                
    $http.get($scope.metadata).then(function(response){
        $scope.meta=response.data;
    },function(error){
        console.log(error);
    });
})

.filter('embedUrl', function ($sce) {
    return function(meta) {
        var url="https://buddycloud.org/api/"+meta.entityId+"/media/"+meta.id;
      return $sce.trustAsResourceUrl(url);
}});
