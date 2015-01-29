var MAP=null;
angular.module('XmppMap', ['XmppCore'])

/*
Login

This modul needs cleanup. The session is not stable. Reconnect doesn't really work. I was happy to have a connection.
*/

.directive('xmppmap', function() {
    return {
        'restrict': 'E',
        'scope': {},
        'transclude': false,
        'templateUrl': 'modules/xmppmap/template.html',
        'controller': 'XmppMapController',
        'link': function(scope, element, attrs) {
            console.log("map");
        }
    };
})



.controller('XmppMapController', ['$scope', 'Xmpp',"leafletData",
    function($scope, Xmpp,leafletData) {
        leafletData.getMap().then(function(map) {
            MAP=map;
            setTimeout(function(){
            map.invalidateSize();
            },100);
            console.log("got map");
//                    map.fitBounds([ [40.712, -74.227], [40.774, -74.125] ]);
        });
    }
])
