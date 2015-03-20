
//angular.module("XmppUI", [ 'Buddycloud','BuddycloudRoster','XmppCore','XmppLike','XmppUI','XmppLogin','Minichat','XmppForm','XmppRoster','XmppMuc'])
angular.module("XmppUI", [ 'Buddycloud','AngularXmpp','XmppRoster','Minichat','XmppMessage','XmppForm'])



.directive('xmpp', function() {
    return {
        'restrict': 'E',
        'scope': {
            host:"@",
            anonymous:"@",
            oninit:"&"
        },
        'transclude': false,
        'controller': 'xmppController',
        'link': function(scope, element, attrs) {
            scope.host=attrs.host;
            scope.anonymous=attrs.anonymous;
        }
    };

})
.controller('xmppController',function($scope,Xmpp){
    this.init=function(){
        console.log($scope.host);
    };
    this.xmpp=new Xmpp($scope.host);
    var self=this;
    
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
        console.log("notification",notification);
        if(!self.xmpp.ticks){
            self.xmpp.ticks=0;
            $scope.$emit("connected","xx");
        }
        self.xmpp.ticks++;
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

    if($scope.anonymous){
        console.log("let me in");
        this.xmpp.anonymouslogin();
    }
});
