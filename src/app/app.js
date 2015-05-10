var SCOPE=null;
//angular.module('XmppApp', [ 'templates-app', 'templates-common','AngularXmpp','ngSanitize','ui.bootstrap','ngAnimate' ]) 
angular.module('XmppApp', [ 'templates-app', 'templates-common','AngularXmpp','ngSanitize' ]) 
.controller('page', ['$scope','$rootScope','$http','$location', function($scope,$rootScope,$http,$location) {
    $scope.page="main";
    SCOPE=$scope;
    var node=$location.$$url;
    if(node){
        $scope.node=node;
    }else{
        $scope.node="/user/lobby@laos.buddycloud.com/posts";
    }
//        $scope.node="recent";
    $scope.setnode=function(node){
        $scope.page="main";
        $scope.node=node;
        location.hash=node;
        scrollTo("scrolltarget");
    };
    function scrollTo(id){
        console.log(id);
        var element=document.getElementById(id);
        var rect = element.getBoundingClientRect();
        console.log(rect.top);
        var pos=window.scrollY +rect.top -65;
        console.log(rect.top,window.scrollY,pos);
        //element.textContent=rect.top+"; "+window.scrollY+"; "+pos;;
        window.scrollTo(0,pos);
    }
    $scope.initchat=function(chat){
        console.log("chat scope",chat);
        $scope.chat=chat;
    };
    $scope.openchat=function(jid){
        console.log("openchat",jid,$scope.chat);
        $scope.chat.openchat(jid);
    };
    $scope.invite=function(jid){
        alert(jid);

    }
    $scope.startVideoChat=function(jid){
        console.log("start video chat",jid);
        $scope.call=jid;
    };
    $rootScope.$on('$locationChangeSuccess', function (data) {
        console.log('$locationChangeSuccess changed!', new Date(),data);
        console.log("opening",$location,$location.$$url);
        $scope.page="main";
        var node=$location.$$url;
        if(node=="/recent"){
            node="recent";
        }
        if(node===""){
            node="recent";
        }
        console.log("this node should open",node);
        $scope.node=node;
    });
}]);

