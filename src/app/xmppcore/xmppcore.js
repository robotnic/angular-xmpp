var XMPP=null;
angular.module("AngularXmpp", [ 'AngularXmppServices','Buddycloud','xmppLogin','XmppRoster','Minichat','XmppForm','buddycloudSearch','xmppNotifications','xmppRequests','Avatar','Usermenu','ngSanitize','ui.bootstrap','BuddycloudRecommondations',"Webrtc","BuddycloudPost","BuddycloudMedia","BuddycloudInvite",'XmppMuc','Settings' ])



.directive('xmpp', function() {
    return {
        'restrict': 'E',
        'scope': {
            websocket:"=",
            xmppdomain:"=",
            host:"@",   //deprecated
            defaultdomain:"@", //deprecated
            anonymous:"@",
            oninit:"&"
        },
        'transclude': false,
        'controller': 'xmppController',
        'link': function(scope, element, attrs) {
//            scope.host=attrs.host; //? is that needed
            scope.anonymous=attrs.anonymous; //?needed
 //           scope.init();
        }
    };

})
.controller('xmppController',['$scope','Xmpp',function($scope,Xmpp){
    XMPP=$scope; 
    if(!$scope.host)$scope.host=$scope.websocket;
    console.log("---h1---",$scope.host);
    $scope.init=function(){
        console.log("-------host-----",$scope.host,$scope.defaultdomain);
        if(!$scope.defauldomain)$scope.defauldomain=$scope.xmppdomain;
        this.defaultdomain=$scope.defaultdomain;


        //the angular magic
        $scope.xmpp.watch().then(function(data){
            console.log("try to relogin",data);
            setTimeout(function(){
            $scope.xmpp.send($scope.xmpp.data.credentials.command,$scope.xmpp.data.credentials.request).then(function(){
                $scope.init();
            });
            },2000);
        },function(error){
            console.log(error);
        },function(notification){
            console.log("notification",notification);
        });


    };
    console.log("connect to: ",$scope.host);
    $scope.xmpp=new Xmpp($scope.host);
    this.defaultdomain=$scope.defaultdomain;
    this.xmpp=$scope.xmpp;
    

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

    $scope.init();
}]);
