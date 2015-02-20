console.log(1);
angular.module("XmppUI", [ 'Buddycloud','BuddycloudRoster','XmppCore','XmppLike','XmppUI','XmppLogin','Minichat','XmppForm','XmppRoster','XmppMuc'])



.directive('xmpp', function() {
    return {
        'restrict': 'E',
        'scope': {
            host:"@",
            oninit:"&"
        },
        'transclude': false,
        'controller': 'xmppController',
        'link': function(scope, element, attrs) {
            console.log("eh da");
            scope.host=attrs.host;
        }
    };

})
.controller('xmppController',function($scope,Xmpp){
    console.log($scope.host);
    this.init=function(){
        console.log($scope.host);
    };
    this.xmpp=new Xmpp($scope.host);
/*
    this.xmpp.connect().then(function(data){
        console.log("online");
    });
*/

    this.xmpp.watch().then(function(data){
        console.log(data);
    },function(error){
        console.log(error);
    },function(notification){
        console.log("-------------",notification);
        if(notification.status){
            $scope.$emit("connected",notification);
        }
    });
    this.xmpp.openchat=function(jid){
            console.log("openchat",jid);
            $scope.$emit("openchat",jid);
    };
    this.xmpp.addContact=function(jid){
            $scope.$emit("addcontact",jid);
    };

    this.on=function(){
        $scope.$on.apply($scope,arguments);
    };
    console.log("xmpp",this.xmpp);
    $scope.oninit({scope:this.xmpp});
});
console.log(2);
