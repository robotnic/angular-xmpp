var XMPP=null;

angular.module("AngularXmpp", [ 'AngularXmppServices','Buddycloud','xmppLogin','XmppRoster','Minichat','XmppForm','buddycloudSearch','xmppNotifications','xmppRequests','Avatar','Usermenu','ngSanitize','ui.bootstrap','BuddycloudRecommondations',"Webrtc","BuddycloudPost","BuddycloudInvite" ])



.directive('xmpp', function() {
    return {
        'restrict': 'E',
        'scope': {
            host:"@",
            defaultdomain:"@",
            anonymous:"@",
            oninit:"&"
        },
        'transclude': false,
        'controller': 'xmppController',
        'link': function(scope, element, attrs) {
            scope.host=attrs.host;
            scope.anonymous=attrs.anonymous;
            scope.init();
        }
    };

})
.controller('xmppController',['$scope','Xmpp',function($scope,Xmpp){
    
    $scope.init=function(){
        console.log("-------host-----",$scope.host,$scope.defaultdomain);
        this.defaultdomain=$scope.defaultdomain;
//        $scope.xmpp.send("xmpp.login",{jid:"elke@laos.buddycloud.com",password:"bbb"}).then(function(){$scope.xmpp.send("presence");}); //todo: remove line
    };
    $scope.xmpp=new Xmpp($scope.host);
    XMPP= $scope.xmpp;
    this.defaultdomain=$scope.defaultdomain;
    this.xmpp=$scope.xmpp;
    
    //the angular magic
    $scope.xmpp.watch().then(function(data){
        console.log("try to relogin",data);
        setTimeout(function(){
        $scope.xmpp.send($scope.xmpp.data.credentials.command,$scope.xmpp.data.credentials.request);
        },2000);
    },function(error){
        console.log(error);
    },function(notification){
        console.log("notification",notification);
        if(!$scope.xmpp.ticks){
            $scope.xmpp.ticks=0;
        }
        $scope.xmpp.ticks++;
    });

    $scope.on=function(){
        $scope.$on.apply($scope,arguments);
    };
    console.log("xmpp",$scope.xmpp);
    $scope.oninit({scope:$scope.xmpp});

    if($scope.anonymous){
        console.log("let me in");
        $scope.xmpp.socket.send(
            'xmpp.login.anonymous',
            {
                "jid": "laos.buddycloud.com"
            }
        );
    }
}]);
