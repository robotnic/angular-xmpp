angular.module("buddycloudSearch",[])
.directive("buddycloudsearch",function(){
  return {
        'require': '^buddycloud',
        'restrict': 'E',
        'scope': {
            onnodechange:"&"
        },
        'controller': 'searchController',
        'transclude': false,
        'templateUrl': 'buddycloud-search/template.tpl.html',
        'link': function(scope, element, attrs,events) {
            scope.events=events;
            STREAM=scope;
            events.connect().then(function(bc){
                scope.bc=bc;
            });

        }
    };
})
.controller("searchController",function($scope,$http){                
     $scope.getLocation = function(text) {
          var stanza = {
                form: [{
                    "var": 'content',
                    "value": text
                }]
            };

        return $scope.bc.send( 'xmpp.buddycloud.search.do', stanza).then(function(response){
            console.log(response);
            return response.results.map(function(item){
                console.log("map",item.entry.atom.content.content);
                return {
                        text:"<b>"+item.node+"</b><br/>"+item.entry.atom.content.content,
                        node:item.node
                    };
            });
        });
    };
    $scope.onSelect=function(item){
        $scope.onnodechange({node:item.node});
        $scope.asyncSelected="";
    };
});
