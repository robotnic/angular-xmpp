var SCOPE = null; //debug
var xmpps = [];
var buddyclouds = [];
/*
    var testaccount1="test1@buddycloud.org";
    var testaccount2="test2@buddycloud.org";
    var testaccount3="test3@buddycloud.org";
*/

var testaccount1 = "test1@laos.buddycloud.com";
var testaccount2 = "test2@laos.buddycloud.com";
var testaccount3 = "test3@laos.buddycloud.com";





angular.module('Test', ['AngularXmpp','jsonFormatter'])
    .controller("test", function($scope, Xmpp, $timeout, $http, $q, BuddycloudFactory) {



        $scope.xmpps = xmpps;
        SCOPE = $scope;
        $scope.buddycloud = new BuddycloudFactory();
        var steptime = 2000;
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

        function initsocket() {
            //var xmpp=new Xmpp("https://buddycloud.org/");
            var xmpp = new Xmpp("https://laos.buddycloud.com/");
            //var xmpp=new Xmpp("https://xmpp-ftw.jit.su/");

            xmpp.watch().then(function(data) {
                console.log("destroy xmpp");
            }, function(error) {
                console.log("xmpp error", error);
            }, function(notification) {
                console.log("xmpp update", notification); //$apply
            });
            console.log("startwatch");
            return xmpp;
        }



        /**
login
*/
        $scope.login = function() {
            $scope.good = 0;
            $scope.bad = 0;
            $scope.counter = 0;
            $scope.check = ["me"]

            $q.all({
                commands: $http.get('tests/login/commands.json'),
                expected: $http.get('tests/login/expected.json')
            }).then(function(response) {
                console.log("++", response);
                starttest("xmpps", response.commands.data, response.expected.data);
            });


        }


        $scope.login();
        /**
xmppcore
*/


        $scope.loadcoretest = function() {
            $scope.good = 0;
            $scope.bad = 0;
            $scope.counter = 0;
            $scope.allcommands.length = 0;
            $scope.check = ["me", "roster", "connected"];

            $q.all({
                commands: $http.get('tests/core/commands.json'),
                expected: $http.get('tests/core/expected.json')
            }).then(function(response) {
                console.log("++", response);
                starttest("xmpps", response.commands.data, response.expected.data);
            });
        }



        $scope.loadbuddycloudtest = function(dir) {
            console.log("dada");
            $scope.good = 0;
            $scope.bad = 0;
            $scope.counter = 0;
            $scope.check = ["nodes", "unread", "affiliations","tree","result"];

            $q.all({
                commands: $http.get('tests/'+dir+'/commands.json'),
                expected: $http.get('tests/'+dir+'/expected.json')
            }).then(function(response) {
                console.log("++", response);
                starttest("buddyclouds", response.commands.data, response.expected.data);
            });
            for (var i = 0; i < 3; i++) {
                buddyclouds[i] = new BuddycloudFactory(xmpps[i]);
                buddyclouds[i].watch().then(function(data) {
                    console.log("destroy buddycloud");
                }, function(error) {
                    console.log("buddycloud error", error);
                }, function(notification) {
                    console.log("buddycloud update", notification); //$apply
                });

            }


        }





        /**
common
*/

        $scope.results = [];

        function starttest(prefix, commands, expected) {

            for (var i = 0; i < 3; i++) {
                $scope.commands[i] = [];
            }

            commands = replaceTestAccount(commands);
            expected = replaceTestAccount(expected);
            $scope.expected = expected;
            for (var i = 0; i < commands.length; i++) {
                var c = commands[i];
                var command = prefix + "[" + c[0] + "]." + c[1];
                console.log(command);
                testit(i, c[0], command, prefix);
            }

        }

        function testit(i, c, command, type) {
            console.log(arguments);
            $timeout(function() {
                console.log("eval", command);
                console.log(buddyclouds[0]);
                window.eval(command);
                var comm = {
                    i: i,
                    command: command
                };
                $scope.commands[c].push(comm);
                $scope.allcommands.push(comm);
            }, i * steptime);
            $timeout(function() {
                var good = 0;
                var bad = 0;
                $scope.counter++;
                if (!$scope.results[i]) $scope.results[i] = [];
                console.log("--------data", xmpps[c].data, buddyclouds, i, $scope.counter);
                $scope.allcommands[i].checkresults = [];

                console.log(" A C H T U N G  type", type);
                /** core */
                if (type == "xmpps") {
                    for (var j = 0; j < xmpps.length; j++) {
                        $scope.results[i][j] = JSON.parse(JSON.stringify(xmpps[j].data));
                        //$scope.results[i][j]=JSON.parse(JSON.stringify(buddyclouds[j].data)); 
                        $scope.allcommands[i].checkresults[j] = {};
                        for (var k = 0; k < $scope.check.length; k++) {
                            var prop = $scope.check[k];
                            console.log("compare", prop, $scope.results[i][j][prop], $scope.expected[i][j][prop]);
                            if (angular.equals($scope.results[i][j][prop], $scope.expected[i][j][prop])) {
                                good++;
                                $scope.allcommands[i].checkresults[j][prop] = true;
                            } else {
                                bad++;
                                $scope.allcommands[i].checkresults[j][prop] = false;
                            }
                        }
                    }
                }

                /** buddycloud */

                if (type == "buddyclouds") {
                    for (var j = 0; j < buddyclouds.length; j++) {
                        $scope.results[i][j] = JSON.parse(JSON.stringify(buddyclouds[j].data));
                        console.log($scope.results[i][j]);
                        //$scope.results[i][j]=JSON.parse(JSON.stringify(buddyclouds[j].data)); 
                        $scope.allcommands[i].checkresults[j] = {};
                        for (var k = 0; k < $scope.check.length; k++) {
                            var prop = $scope.check[k];
                            if($scope.expected[i]){
                                console.log("compare", prop, $scope.results[i][j], $scope.expected[i][j]);
                                console.log("compare", prop, $scope.results[i][j][prop], $scope.expected[i][j][prop]);
                                if (angular.equals($scope.results[i][j][prop], $scope.expected[i][j][prop])) {
                                    good++;
                                    $scope.allcommands[i].checkresults[j][prop] = true;
                                } else {
                                    bad++;
                                    $scope.allcommands[i].checkresults[j][prop] = false;
                                }
                            }
                        }
                    }
                }





                $scope.allcommands[i].good = good;
                $scope.good += good;
                $scope.allcommands[i].bad = bad;
                $scope.bad += bad;
                $scope.resultstring = JSON.stringify($scope.results, null, "  ");
            }, (i + 1) * steptime - 100);

        }

        function replaceTestAccount(response) {
            var string = JSON.stringify(response);
            string = string.replace("test1@laos.buddycloud.com", testaccount1);
            string = string.replace("test2@laos.buddycloud.com", testaccount2);
            string = string.replace("test3@laos.buddycloud.com", testaccount3);
            return JSON.parse(string);
        }

    })






;
