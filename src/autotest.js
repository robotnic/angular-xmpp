var SCOPE = null; //debug

//GLOBALS
var xmpps = [];
var buddyclouds = [];
var messages = [];


/*
    var testaccount1="test1@buddycloud.org";
    var testaccount2="test2@buddycloud.org";
    var testaccount3="test3@buddycloud.org";
*/

var testaccount1 = "test1@laos.buddycloud.com";
var testaccount2 = "test2@laos.buddycloud.com";
var testaccount3 = "test3@laos.buddycloud.com";

var excludefromtest=["receivetime"];





angular.module('Test', ['AngularXmpp','jsonFormatter','angularMoment'])
    .controller("test", function($scope, Xmpp, $timeout, $http, $q, BuddycloudFactory,MessageFactory) { 

        $scope.testplan={
            xmpp:[
            {
                name:"login",
                type:"xmpp",
                check:["me"],
            },{
                name:"roster",
                type:"xmpp",
                check:["me", "roster", "connected","error"],
            },{
                name:"logout",
                type:"xmpp",
                check:["me"],
            }
            ],
            message:[
            {
                name:"message",
                type:"message",
                check:["items","notifications","errors"],
            }
            ],
            buddycloud:[{
                name:"subscription",
                type:"buddycloud",
                check:["subscriptions",  "affiliations","myaffiliations","errors"]
            },
            {
                name:"buddycloud",
                type:"buddycloud",
                check:[ "unread", "affiliations","myaffiliations","items","config","subscriptions","errors"]
            },
            { 
                name:"buddyclouderror",
                type:"buddycloud",
                check:["errors", "unread", "affiliations","myaffiliations","items","config","subscriptions"]
            }]
        }

        $scope.debug=false;
        $scope.uimode=false;
        $scope.ticks=[0,0,0];
        $scope.appstate=[];
        $scope.counter=0;

        $scope.xmpps = xmpps;
        SCOPE = $scope;
//        $scope.buddycloud = new BuddycloudFactory();
        $scope.buddyclouds = buddyclouds;
        $scope.steptime = 3000;
        $scope.commands = [];
        before(3);
        $scope.allcommands = [];


        /**
The xmpp websocket connections
*/

        function before(numberOfConnections) {
            for (var i = 0; i < numberOfConnections; i++) {
                xmpps[i] = initsocket();
                $scope.commands[i] = [];
                console.log($scope.commands);
            }
        }


        /**
        open websocket and initialize the testing
        */

        function initsocket() {
            //var xmpp=new Xmpp("https://buddycloud.org/");
            var xmpp = new Xmpp("https://laos.buddycloud.com/");
            //var xmpp=new Xmpp("https://xmpp-ftw.jit.su/");

            xmpp.watch().then(function(data) {
                console.warn("XMPP END - should never be reached","font-size:40px");
            }, function(error) {
                console.log("error", error);
            }, function(notification) {
                console.log("xmpp update", notification); 

                //measure time since last stanza sent to server
                $scope.allcommands[$scope.counter].time=(new Date()).getTime() - $scope.allcommands[$scope.counter].starttime;

                //count rendering ticks for angular ($apply)
                $scope.allcommands[$scope.counter].ticks++;

                //save the engine state 
                $scope.savestate();

                //check if state id the same as in reference 
                checkresult();
            });
            return xmpp;
        }

        /**
        save the object state to compare it later
        */

        $scope.savestate=function(){
            var command=$scope.allcommands[$scope.counter];
            console.log("SAVING",$scope.counter);
            if(!command){
                console.log("no command");
                return false;
            }
            if(!$scope.appstate[$scope.counter])$scope.appstate[$scope.counter]=[];
                if(command.type=="xmpp"){
                    for(var i=0;i<xmpps.length;i++){
                        $scope.appstate[$scope.counter][i]=JSON.parse(JSON.stringify(xmpps[i].data));
                    }
                }
                if(command.type=="buddycloud"){
                    for(var i=0;i<buddyclouds.length;i++){
                        $scope.appstate[$scope.counter][i]=JSON.parse(JSON.stringify(buddyclouds[i].data));
                    }
                }
                if(command.type=="message"){
                    for(var i=0;i<messages.length;i++){
                        $scope.appstate[$scope.counter][i]=JSON.parse(JSON.stringify(messages[i]));
                    }
                }
                if(command.type=="muc"){
                    for(var i=0;i<buddyclouds.length;i++){
                        $scope.appstate[$scope.counter][i]=JSON.parse(JSON.stringify(mucs[i].data));
                    }
                }

            return true;
        }

        /**
        the counter will be increased when a stanza is sent to the server.
        After sucessfully completed the testcase it is possible to navigate the result using cursor keys
        */


        $scope.setCounter = function(c) {
            $scope.counter=c;
        }


        /**
        Keyboared control to navigate test result
        */

        $scope.down = function(e) {
            switch(e.keyCode){
                case 37:
                    $scope.counter--;
                    break;
                case 39:
                    $scope.counter++;
                    break;
            }
        }

        /**
        login
        */
/*
        $scope.login = function() {
            $scope.good = 0;
            $scope.bad = 0;
            $scope.counter = 0;
            $scope.check = ["me"]

            $q.all({
                commands: $http.get('assets/tests/xmpp/login/commands.json'),
                expected: $http.get('assets/tests/xmpp/login/expected.json')
            }).then(function(response) {
                starttest(response.commands.data, response.expected.data);
            });


        }


        $scope.login();
*/
        /**
xmppcore
*/

/**
        $scope.loadcoretest = function() {
            $scope.good = 0;
            $scope.bad = 0;
            $scope.counter = 0;
            $scope.allcommands.length = 0;
            $scope.check = ["me", "roster", "connected"];

            $q.all({
                commands: $http.get('assets/tests/core/commands.json'),
                expected: $http.get('assets/tests/core/expected.json')
            }).then(function(response) {
                starttest(response.commands.data, response.expected.data);
            });
        }
*/

        $scope.loadTest=function(test){
            window.location.hash = "#" + test.type+'/'+test.name;
            window.location.reload(true);
        }

        $scope.doTest=function(test){
            $scope.good = 0;
            $scope.bad = 0;
            $scope.counter = 0;
            $scope.allcommands.length = 0;
            $scope.check = test.check;

            $q.all({
                commands: $http.get('assets/tests/'+test.type+'/'+test.name+'/commands.json'),
                expected: $http.get('assets/tests/'+test.type+'/'+test.name+'/expected.json')
            }).then(function(response) {
                starttest(response.commands.data, response.expected.data);
            });
            if(test.type=="buddycloud"){
                for (var i = 0; i < 2; i++) {
                    buddyclouds[i] = new BuddycloudFactory(xmpps[i]);
                }
            }
            if(test.type=="message"){
                for (var i = 0; i < 3; i++) {
                    messages[i] = new MessageFactory(xmpps[i]);
                }
            }
        }

        $scope.doTest($scope.testplan.xmpp[0]);
       

        $timeout(function(){
            var name=window.location.hash.split("/")[1]; 
            var type=window.location.hash.split("/")[0]; 
            type=type.substr(1);
            console.log(type,name);
            var topic=$scope.testplan[type];
            for(var i=0;i<topic.length;i++){
                if(topic[i].name==name){
                    console.log(topic[i]);
                    $scope.doTest(topic[i]);
                }
            }
        },4*$scope.steptime);
/*
        $scope.loadbuddycloudtest = function(dir) {
            $scope.good = 0;
            $scope.bad = 0;
            $scope.counter = 0;
            $scope.allcommands.length = 0;
            $scope.check = [ "subscriptions","unread", "affiliations","myaffiliations","items","config"];

            $q.all({
                commands: $http.get('assets/tests/'+dir+'/commands.json'),
                expected: $http.get('assets/tests/'+dir+'/expected.json')
            }).then(function(response) {
                starttest(response.commands.data, response.expected.data);
            });
            for (var i = 0; i < 2; i++) {
                //buddycloudInit(i);
                buddyclouds[i] = new BuddycloudFactory(xmpps[i]);
            }


        }
*/







        /**
common
*/

        $scope.results = [];

        function starttest( commands, expected) {
            
            for (var i = 0; i < 3; i++) {
                $scope.commands[i] = [];
            }

            commands = replaceTestAccount(commands);
            expected = replaceTestAccount(expected);
            $scope.expected = expected;
            for (var i = 0; i < commands.length; i++) {
                var c = commands[i];
                var command = c[1]+"s[" + c[0] + "]." + c[2];

                var comm = {
                    i: i,
                    type: c[1],
                    command: command,
                    ticks:0
                };
                $scope.commands[c[0]].push(comm);
                $scope.allcommands.push(comm);


                testit(comm);
            }

        }

        function testit(comm) {
            $timeout(function() {
                console.log("================eval", comm.command);
                comm.starttime=(new Date()).getTime();
                /*
                var comm = {
                    i: i,
                    type: type,
                    command: command,
                    starttime:(new Date()).getTime(),
                    ticks:0
                };
                $scope.commands[c].push(comm);
                $scope.allcommands.push(comm);
                */
                window.eval(comm.command);
            }, (comm.i) * $scope.steptime );
            $timeout(function() {

                checkresult(true);
                //counter
                console.log("LLLL",$scope.allcommands.length,$scope.counter);
                if(($scope.allcommands.length -1) > $scope.counter){
                    $scope.counter++;
                    $scope.savestate();
                }else{
                    console.log("kann nicht zählern");
                }
            }, (comm.i + 1) * $scope.steptime - 100);

        }

        function checkresult(goodbadcount){
                console.log("checkresult",$scope.counter);
                var good = 0;
                var bad = 0;
                $scope.allcommands[$scope.counter].checkresults = [];

                /** core */
                    for (var j = 0; j < xmpps.length; j++) {
                        //$scope.results[i][j] = JSON.parse(JSON.stringify(xmpps[j].data));
                        //$scope.results[i][j]=JSON.parse(JSON.stringify(buddyclouds[j].data)); 
                        $scope.allcommands[$scope.counter].checkresults[j] = {};
                        var command=$scope.allcommands[$scope.counter];
                        for (var k = 0; k < $scope.check.length; k++) {
                            var prop = $scope.check[k];
                            if($scope.expected[$scope.counter] && $scope.expected[$scope.counter][j] && $scope.appstate[$scope.counter] && $scope.appstate[$scope.counter][j]){
                                if (equals($scope.appstate[$scope.counter][j][prop], $scope.expected[$scope.counter][j][prop])) {
                                    good++;
                                    $scope.allcommands[$scope.counter].checkresults[j][prop] = "ok";
                                } else {
                                    bad++;
                                    $scope.allcommands[$scope.counter].checkresults[j][prop] = "notok";
                                }
                            }
                        }
                    }


                $scope.allcommands[$scope.counter].good = good;
                $scope.allcommands[$scope.counter].bad = bad;
                if(goodbadcount){
                    $scope.good += good;
                    $scope.bad += bad;
                }
                $scope.resultstring = JSON.stringify($scope.appstate, null, "  ");


                console.log($scope.counter,$scope.allcommands[$scope.counter].checkresults);


        };

        function equals(a,b){
            var a=JSON.stringify(a,replacer);
            var b=JSON.stringify(b,replacer);
            
            return a==b;
        }

        /**
        exclude variable items like time from comparison
        */

        function replacer(key,value){
            if(excludefromtest.indexOf(key)!==-1){
                return "";
            }else{
                return value;
            }
        }

        /**
        For the funny people case
        */


        function replaceTestAccount(response) {
            var string = JSON.stringify(response);
            string = string.replace("test1@laos.buddycloud.com", testaccount1);
            string = string.replace("test2@laos.buddycloud.com", testaccount2);
            string = string.replace("test3@laos.buddycloud.com", testaccount3);
            return JSON.parse(string);
        }

    })






;
