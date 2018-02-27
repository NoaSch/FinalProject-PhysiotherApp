chosenExe = undefined;
/**
 * Created by NOA-PC on 12/21/2017.
 */
angular.module("myApp")
    .controller('exerciseController', ['$http', '$location', '$window','$rootScope','$scope','programService','exerciseService','ipconfigService', function ($http,$location, $window,$rootScope,$scope,programService,exerciseService,ipconfigService ) {
        let self = this;
       self.chosenExe = {};
       self.videosURL = {};
        //self.userName = "noa";
        //let ip = "192.168.1.15";
        //let port = 3000;
        //let ipAndProt = "http://10.100.102.13:4000";
        //self.videoURL = "http:192.168.1.15:4001/api/video/2017-12-08 03:04:44.000";


        //load exercises details
        let req = {
            method: 'POST',
            //url: 'http://192.168.1.15:3000/api/getProgramExe',
            //url: 'http://132.73.201.132:3000/api/getProgramExe',
            //url: 'http://10.100.102.11:3000/api/getProgramExe',
            url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getProgramExe', //server university
            headers: {
                'Content-Type': "application/json"
            },
            data: {
                "prog_id": programService.getProgID()
            }
        };
        $http(req).then(function (ans) {
            self.exercises = ans.data;
            // self.programs = [];
            /* for (i = 0; i < progs.length; i++) {
             self.programs.push(progs.prog_id);
             }*/
            console.log("number of exe::::" + self.exercises.length)
            console.log(self.exercises);
            self.exercises.forEach(function (element) {
                self.chosenExe[element.exe_id] = false;
                if(element.media_path != null) {
                    //self.videosURL[element.exe_id] = "http://10.100.102.11:3000/api/mediaGet/"+element.media_path;
                    self.videosURL[element.exe_id] = "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + "/api/mediaGet/" + element.media_path;
                    console.log("viseoPath!!!!!!!!!!!!!!!!!!!");
                }
                console.log(self.videosURL[element.exe_id]);
                /*let reqVideo = {
                    method: 'POST',
                    //url: 'http://192.168.1.15:3000/api/getProgramExe',
                    //url: 'http://132.73.201.132:3000/api/getProgramExe',
                    url: 'http://10.100.102.11:3000/api/media',
                    headers: {
                        'Content-Type': "application/json"
                    },
                    data: {
                        "path": element.media_path
                    }
                };

                $http(reqVideo).then(function (ans) {
                    self.videosURL[element.exe_id] = ans.data;
                }).catch(function (err) {
                    console.log(err)
                });*/
            });

        }).catch(function (err) {
            console.log(err)
        });

        //foreach video - get the url - check later if it batter only in click
        /*self.exercises.forEach(function (element) {
            let reqVideo = {
                method: 'POST',
                //url: 'http://192.168.1.15:3000/api/getProgramExe',
                //url: 'http://132.73.201.132:3000/api/getProgramExe',
                url: 'http://10.100.102.11:3000/api/api/media',
                headers: {
                    'Content-Type': "application/json"
                },
                data: {
                    "path": element.media_path
                }
            };

            $http(req).then(function (ans) {
                self.videosURL[element.exe_id] = ans.data;
            }).catch(function (err) {
                console.log(err)
            });

        });

        //load exercises details
        /*let req = {
            method: 'POST',
            //url: 'http://192.168.1.15:3000/api/getProgramExe',
            //url: 'http://132.73.201.132:3000/api/getProgramExe',
            url: 'http://10.100.102.11:3000/api/getProgramExe',
            headers: {
                'Content-Type': "application/json"
            },
            data: {
                "prog_id": programService.getProgID()
            }
        };
        $http(req).then(function (ans) {
            self.exercises = ans.data;
            console.log("number of exe::::" + self.exercises.length)
            console.log(self.exercises);
            self.exercises.forEach(function (element) {
                self.chosenExe[element.exe_id] = false;
            });
            console.log(self.chosenExe);
        }).catch(function (err) {
            console.log(err)
        });*/


        self. clickDet = function(exe_id){
            self.chosenExe[exe_id] = true;
            self.exercises.forEach(function (element) {
                if(element.exe_id != exe_id)
                {
                    self.chosenExe[element.exe_id] = false;
                }
                });

            console.log("exercise chosen: " + exe_id);
            console.log("exercise chosen: " +self.chosenExe[exe_id]);
        }
    }]);