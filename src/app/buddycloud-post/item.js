angular.module("BuddycloudPost",[])
.directive("buddycloudPost",function(){
  return {
        'require': '^buddycloud',
        'restrict': 'E',
        'scope':{
            text:"=" 
        },
        'controller': 'BuddycloudPostController',
        'transclude': false,
        'templateUrl': 'buddycloud-post/template.tpl.html',
        'link': function(scope, element, attrs,xmppController) {
        }
    };
})
.controller("BuddycloudPostController",function($scope,$http,$sce){                
    var oldurl=null;
    //$scope.parse=function(text){
    $scope.$watch("text",function(text){
        if(!text){
           $scope.ogp=null;
           $scope.img=null;
           $scope.url=null;
            return; 
        }
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        text.replace(urlRegex, function(url) {
            loadogp(url);
        })

    })

    function loadogp(url){
        if(oldurl && oldurl==url){
            return;
        }
    //    var parseurl="http://localhost/test/og/php-ogp/example.php?url="+url;
        //var parseurl="http://datenkueche.com/buddycloud/ogp/crawler.php?url="+url;
        var parseurl="https://open.iframe.ly/api/oembed?url="+url+"&origin=http://buddycloud.org"
        //var parseurl="http://localhost:3000/?url="+url;
        $http.get(parseurl).then(function(response){
            $scope.ogp=response.data;
            console.log("----------------",$scope.ogp);
            try{
                $scope.url=$sce.trustAsResourceUrl($scope.ogp['url']);
                $scope.img=$sce.trustAsResourceUrl($scope.ogp['thumbnail_url']);
                /*
                if($scope.ogp['twitter:player']){
                    $scope.url=$sce.trustAsResourceUrl($scope.ogp['twitter:player']);  //don't want autostart on vimeo
                }else{
                    $scope.url=$sce.trustAsResourceUrl($scope.ogp['og:video:secure_url'][0]);  
                }
                */
            }catch(e){
                /*
                if($scope.ogp['og:image'] && typeof($scope.ogp['og:image']=='string')){
                    console.log($scope.ogp['og:image']);
                    $scope.img=$sce.trustAsResourceUrl($scope.ogp['og:image']);
                }else{
                    $scope.img=$sce.trustAsResourceUrl($scope.ogp['twitter:image']);
                }
                */
            }
        },function(error){
            console.log(error);
        })
        oldurl=url;
    }

});
