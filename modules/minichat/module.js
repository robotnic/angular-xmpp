angular.module('Minichat', ['XmppCore'])

/*
Roster
*/

.directive('xmppminichat', function() {
    return {
        'restrict': 'E',
        'scope': {
        },
        'transclude': false,
        'templateUrl': 'modules/minichat/template.html',
        'controller': 'XmppUiMinichat',
        'link': function(scope, element, attrs) {
            console.log("minichat");
        }
    };
})


    .controller('XmppUiMinichat', ['$scope','$rootScope', '$location', '$anchorScroll','Xmpp',
        function($scope, $rootScope,$location, $anchorScroll,Xmpp) {
            $scope.roster=Xmpp.roster;
            $scope.username=Xmpp.user;
            console.log(Xmpp.jid,Xmpp.user);
            $rootScope.$on("openchat",function(data,user){
                console.log("user",user);
                    for(var i=0;i<Xmpp.roster.length;i++){
                        var item=Xmpp.roster[i];
                        console.log(item,user);
                        console.log(item.jid.user,user.jid.user , item.jid.domain,user.jid.domain);
                        if(item.jid.user==user.jid.user && item.jid.domain==user.jid.domain){
                                console.log("MATCH");
                                $scope.open(item);
                                return;
                        }
                    }
            });

            $scope.open = function(user) {
                console.log("open", user);
                user.opened = "max";
            };
            $scope.close = function(user) {
                user.opened = false;
            }
            $scope.minify = function(user) {
                user.opened = "min";
                console.log("min", user);
            }
            //send chat message 
            $scope.send = function(user,event) {
                console.log(arguments,this);
                var jid=user.jid.user+"@"+user.jid.domain;
                var message = {
                    to: jid,
                    content: user.newtext
                }
                Xmpp.send(user,message);
                user.newtext = "";
            }

    }
])
