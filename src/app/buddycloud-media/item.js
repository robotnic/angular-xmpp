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
        console.log($scope.meta);
        if($scope.meta.mimeType=="application/octet-stream"||$scope.meta.mimeType=="application/json"){   //should be application/json
            $scope.loadData(response.data);
        }
    },function(error){
        console.log(error);
    });

    $scope.loadData=function(meta){
        var url="https://buddycloud.org/api/"+meta.entityId+"/media/"+meta.id;
        console.log(url);
        $http.get(url).then(function(response){
            console.log(url,response);
            if(response.data.type=="Feature" || response.data.type=="FeatureCollection"){
                $scope.geojson=response.data;
            }
        },function(error){
            console.log(error);
        });
    }
})

.filter('embedUrl', function ($sce) {
    return function(meta) {
        var url="https://buddycloud.org/api/"+meta.entityId+"/media/"+meta.id;
      return $sce.trustAsResourceUrl(url);
}});
