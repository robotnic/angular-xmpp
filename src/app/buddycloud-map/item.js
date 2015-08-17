'use strict'
angular.module("BuddycloudMap",["leaflet-directive"])
.directive("buddycloudMap",function(){
  return {
        'require': '^buddycloud',
        'restrict': 'E',
        'scope':{
            json:"=" 
        },
        'controller': 'BuddycloudMapController',
        'transclude': false,
        'templateUrl': 'buddycloud-map/template.tpl.html',
        'link': function(scope, element, attrs,xmppController) {
        }
    };
})
.controller("BuddycloudMapController",function($scope,$http,$sce,leafletData){                
            $scope.cente= {
                lat: 38.51,
                lng: 139,
                zoom: 4
            }
            leafletData.getMap().then(function(map) {
                $scope.map=map; 
                $scope.geojson= {
                        data: $scope.json,
                        style: {
                            fillColor: "green",
                            weight: 2,
                            opacity: 1,
                            color: 'red',
                            dashArray: '3',
                            fillOpacity: 0.7
                        }
                    }
                var geojsonLayer = L.geoJson($scope.geojson.data);
                $scope.map.fitBounds(geojsonLayer.getBounds());
                //map.fitBounds($scope.bounds);
                //console.log("BOUNDS",$scope.bounds);
            //            bounds: $scope.bounds
            });
});
