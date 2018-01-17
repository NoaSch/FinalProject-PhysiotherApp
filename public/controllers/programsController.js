/**
/**
 * Created by NOA-PC on 12/21/2017.
 */

/*angular.module("myApp")
.controller('programsController', ['$http', '$location', '$window','$scope', function ($http,$location, $window,$scope ) {
    let self = this;
    //self.userName = "noa";
    let ip = "192.168.1.15";
    let port = 4001;
    let testURL = "2017-12-08 03:04:44.000";
    //self.videoURL = "http:192.168.1.15:4001/api/video/2017-12-08 03:04:44.000";
    self.videoURL = "http://" + ip + ":" + port + "/api/video/" + testURL;
    console.log("videoURL"+self.videoURL);
    let req2 = "http://192.168.1.15:4001/api/GetAllVideosPathes";
    $http.get(req2).then(function (ans) {
        self.videos = ans.data;
        self.videosURL = [];
        for (i = 0; i < self.videos.length; i++) {
            self.videosURL.push("http://" + ip + ":" + port + "/api/video/"+self.videos[i].id);
        }
        console.log(self.videosURL);

        //console.log(self.videsPathes);
    });

    //console.log(self.videosPathes);
    let req3 = "http://" + ip + ":" + port + "/api/testUsers";
    $http.get(req3).then(function (ans) {
        self.userName = ans.data[0].username;

        //console.log(self.videsPathes);
    });
    self.changeVideo = function (user) {
        self.videoURL = "http://" + ip + ":" + port + "/api/video/2017-12-20 10:15:37.000";
        // self.videoURL = "http://192.168.1.15:4001/api/video/2017-12-20 10:15:37.000";
    };
}]);*/
angular.module("myApp")
 .controller('programsController', ['AuthenticationService','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','ipconfigService', function (AuthenticationService,$http,$location, $window,$scope,$rootScope,programService,exerciseService,ipconfigService ) {
     let self = this;
     self.authService = AuthenticationService;
     //self.userName = "noa";
     //let ip = "192.168.1.15";
     //let port = 3000;
     //let ipAndProt = "http://10.100.102.13:4000";
     //self.videoURL = "http://" + ip + ":" + port + "/api/video/" + testURL;
     //console.log("videoURL"+self.videoURL);
     //let req = "http://192.168.1.15:4001/api/GetAllVideosPathes";
     let req = {
         method: 'POST',
         //url: 'http://132.73.201.132:3000/api/getUserPrograms',
         //url: 'http://10.100.102.11:3000/api/getUserPrograms',
         url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getUserPrograms',
         // url: 'http://132.73.201.132:4000/api/getUserPrograms',

         headers: {
             'Content-Type': "application/json"
         },
         data: {
             "username": self.authService.userId
         }
     };
     $http(req).then(function (ans) {
         self.programs = ans.data;
        // self.programs = [];
        /* for (i = 0; i < progs.length; i++) {
             self.programs.push(progs.prog_id);
         }*/
         console.log(self.programs);

         //console.log(self.videsPathes);
     }).catch(function (err) {
         console.log(err)
     });

        self.clickProg = function(progid){
            programService.setProgID(progid);
            console.log("scope prog: " + programService.getProgID());
        }
 }]);