angular.module("Avatar",['ngImage'])
.directive("avatar",function(){
  return {
        'require': '^xmpp',
        'restrict': 'A',
        'scope': {
            onopenchat:'&onopenchat',
            avatar:"="
        },
        'controller': "gravatarController",
        'transclude': false,
        'templateUrl': 'avatar/template.tpl.html',
        'link': function(scope, element, attrs,xmppController) {
            scope.size=attrs.size;
            scope.$watch("avatar",function(avatar){
                scope.makeurl(scope.avatar);
            });
        }
    };
})





.controller("gravatarController", function($scope) {
        if($scope.size){
            $scope.size=80;
        }
        $scope.makeurl=function(jid){
            var jidstring="";
            if(typeof(jid)=="string"){
                jidstring = jid;
                if(jid.substring(0,5)=="/user"){
                    jidstring=jid.substring(6,jid.length-6);
                }
            }else{
                if(jid){
                    jidstring = jid.user + "@" + jid.domain;
                }
            }
            var url="//demo.buddycloud.org/api/"+jidstring+"/media/avatar?maxheight="+$scope.size+"&maxwidth="+$scope.size;
            $scope.avatarurl=url;
            return url;
        };


        $scope.report=function(){
            return $scope.makeurl2($scope.avatar);
        };

        $scope.makeurl2=function(jid){
            var url=gravatarurl(jid);
            $scope.avatarurl=url;
            return url;
        };

        function gravatarurl(jid) {
            if (!jid) {
                jid = "fehler@teufel.com";
            }
            var jidstring = 'recent';
            if (typeof(jid) == "string") {
                if (jid !== 'recent') {
                    jidstring = trimjidstring(jid);
                }
            } else {
                jidstring = jid.user + "@" + jid.domain;
            }
            var hash = hashCode(jidstring);
            var url = "//www.gravatar.com/avatar/" + hash + "?d=monsterid&f=y";
            return url;
        }

        function hashCode(s) {
            s = s.split("").reduce(function(a, b) {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
            }, 0);
            s = Math.abs(parseInt(s,10));
            return s;
        }

        function trimjidstring(jid) {
            var user = jid.split("@")[0];
            var domain = jid.split("@")[1];
            if (user.indexOf("/") !== -1) {
                user = user.substring(user.lastIndexOf("/") + 1);
            }
            if (domain.indexOf("/") !== -1) {
                domain = domain.substring(0, domain.indexOf("/"));
            }
            return user + "@" + domain;
        }

    }

);

