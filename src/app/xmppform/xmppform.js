var FORM=null;
console.log("form");
angular.module('XmppForm', ['AngularXmppServices','luegg.directives'])

/*
Roster
*/

.directive('xmppform', function() {
    return {
        'restrict': 'E',
        'scope': {
            formdata:"=",
            onclose:"&",
            onsave:"&"
        },
        'transclude': false,
        'templateUrl': 'xmppform/template.tpl.html',
        'controller': 'XmppUiForm',
        'link': function(scope, element, attrs) {
            console.log("xmppform");
            scope.$watch("formdata",function(formdata){
                console.log("-------------------",formdata);
            });
        }
    };
})


.controller('XmppUiForm', ['$scope',
    function($scope) {
        FORM=$scope;
        console.log($scope.data);
        $scope.close=function(){
            console.log("close");
            $scope.onclose();
        };
        $scope.save=function(){
            console.log("save",$scope.formdata);
            $scope.onsave()($scope.formdata);  //syntax http://weblogs.asp.net/dwahlin/creating-custom-angularjs-directives-part-3-isolate-scope-and-function-parameters
            $scope.onclose();
        };
    }
]);
