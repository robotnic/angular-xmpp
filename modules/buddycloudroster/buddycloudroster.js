var FORM=null;
console.log("form");
angular.module('BuddycloudRoster', ['XmppCore','Buddycloud','luegg.directives'])

/*
Roster
*/

.directive('buddycloudroster', function() {
    return {
        'restrict': 'E',
        'scope': {
            data:"=",
            onclose:"&",
            onsave:"&"
        },
        'transclude': false,
        'templateUrl': 'modules/buddycloudroster/template.html',
        'controller': 'BoudcloudrosterController',
        'link': function(scope, element, attrs) {
            console.log("buddycloudroster");
            scope.$watch("formdata",function(formdata){
                console.log("-------------------",formdata);
            })
        }
    };
})


.controller('BoudcloudrosterController', ['$scope','$rootScope','Xmpp','buddycloudFactory',
    function($scope,$rootScope,Xmpp,buddycloudFactory) {
        BCROSTRE=$scope;
        $scope.bcdata=buddycloudFactory.data;
        $scope.roster=Xmpp.roster;

        console.log("buddycloudFactory.data",buddycloudFactory.data);

        $scope.open=function(node){
            console.log(node);
            $scope.$parent.open(node);
        }        
        $scope.openchat=function(jid){
            console.log("openchat",jid);
            $rootScope.$broadcast('openchat',jid);
        }
        Xmpp.socket.on('xmpp.connection', function(data) {

            Xmpp.getRoster().then(function(data){
                console.log("roster",data);
                Xmpp.setPresence();
            });
        });
    }
])
