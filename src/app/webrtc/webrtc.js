/*jslint node: true */
//'use strict';


/*
Sorry, this are experiments only. Not at all functional.

*/

angular.module("Webrtc",[])
.directive("webrtc",function(){
    return {
        'require': '^xmpp',
        'templateUrl': 'webrtc/template.tpl.html',
        'restrict': 'E',
        'scope': {
            call:'=call',
            onnodechange:'&onnodechange'
        },
        'controller': 'webrtcController',
        'transclude': false,
        'link': function(scope, element, attrs,xmpp) {
            scope.xmpp=xmpp.xmpp;
            console.log("WEBRTC",xmpp,element);
        }
    };

})

.controller("webrtcController",function($scope){
    window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
    window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
    window.URL = window.URL || window.mozURL || window.webkitURL;
    window.navigator.getUserMedia = window.navigator.getUserMedia || window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;

    var servers = {
        iceServers: [
         {url: "stun:23.21.150.121"},
         {url: "stun:stun.1.google.com:19302"}
        ]   
    };

    var pc = new webkitRTCPeerConnection(servers);

    function startVideo(){
        navigator.webkitGetUserMedia({video: true, audio: true}, function(stream) {
            var url=URL.createObjectURL(stream);
            document.getElementById("localvideo").src=url;
            document.getElementById("remotevideo").src=url;
            pc.addStream(stream); 
            pc.createOffer(function(offer){
                console.log("offer",offer);
            $scope.offer=JSON.stringify(offer);
            $scope.offer=offer;
            $scope.$apply();
                OFFER=offer;
              //  pc2.setRemoteDescription(offer);
            });
        },function(error){console.log(error)})
    }


    $scope.start=function(jid){
        startVideo();


        //this part is bullshit

        $scope.xmpp.send("xmpp.chat.message",{to:jid,content:"video chat not implemented"});
        var jingle={
                contents: {
                    sid: "asdf",
                    action: "session-initiate",
                }
            }
//        jingle=OFFER;
        $scope.xmpp.send("xmpp.jingle.request",{to:jid,jingle:jingle});
        console.log(jid);
    }

    $scope.$watch("call",function(jid){
        console.log("call",jid);
        if(jid){
            $scope.start(jid);
        }
    });



    console.log("webrtccontroller");


})

