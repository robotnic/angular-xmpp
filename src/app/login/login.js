angular.module("xmppLogin",[])
.directive("xmpplogin",function(){
  return {
        'require': '^xmpp',
        'restrict': 'E',
        'scope': {
            defaultdomain:"="
        },
        'controller': 'XmppLoginController',
        'transclude': false,
        'templateUrl':function(elem,attrs) {
           return attrs.templateUrl || 'login/template.tpl.html';
        },
        'link': function(scope, element, attrs,xmppController) {
            var up={};
            console.log("login",arguments,xmppController);
            scope.xmpp=xmppController.xmpp;
            scope.defaultdomain=xmppController.defaultdomain;
            console.log("have it",scope.xmpp);
            try{
                up=JSON.parse(localStorage.getItem("usernamepassword"));
                console.log("u/p",up);
            }catch(e){ }
            if(up){
                scope.xmpp.send("xmpp.login",up);  
            }else{
                scope.xmpp.send("xmpp.login.anonymous",{jid:scope.defaultdomain}).then(function(response){
                    console.log(response);
                },function(error){
                    console.log("no anonymous login",error);
                });
            }
        }
    };
})
.controller("XmppLoginController",function($scope,$http){                
        $scope.error="";
        $scope.user={
            jid:"u9@buddycloud.org",
            password:"nix"
        }
        $scope.login=function(user){
            if(user.jid.indexOf("@")==-1){
                user.jid+="@"+$scope.defaultdomain;
            }
            console.log("login directive",user);
            if(user.signup){
                var registerjson={username:user.jid,password:user.password,email:user.email};
                $http({url:"https://demo.buddycloud.org/api/account", method:"post",data:registerjson}).then(function(response){
                    if(response.data=="OK"){
                        user.signup=false;
                    }
                    console.log(response);
                },function(error){
                    console.log(error);
                    if(error.statusText){
                        $scope.error=error.statusText;
                    }else{
                        $scope.error="register error";
                    }
                });
            }else{
                if(user.remember){
                    localStorage.setItem("usernamepassword",JSON.stringify(user));
                }
                if($scope.xmpp.data.me){
                    $scope.xmpp.send("xmpp.logout");  
                }
                $scope.xmpp.send("xmpp.login",user);
            }
        };
        $scope.logout=function(){
            console.log("logout");
            $scope.xmpp.send("xmpp.logout");
            localStorage.removeItem("usernamepassword");
        };
});
