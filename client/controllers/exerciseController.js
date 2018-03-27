chosenExe = undefined;
/**
 * Created by NOA-PC on 12/21/2017.
 */
angular.module("myApp")
    .controller('exerciseController', ['$http', '$location', '$window','$rootScope','$scope','programService','exerciseService','ipconfigService','patientFeedbackService', function ($http,$location, $window,$rootScope,$scope,programService,exerciseService,ipconfigService,patientFeedbackService ) {
        let self = this;
       self.chosenExe = {};
       self.videosURL = {};
        self.feedbackService = patientFeedbackService;
        //load exercises details
        let req = {
            method: 'POST',
            url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getProgramExe',
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
                if(element.media_path != null) {
                    //self.videosURL[element.exe_id] = "http://10.100.102.11:3000/api/mediaGet/"+element.media_path;
                    self.videosURL[element.exe_id] = "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + "/api/mediaGet/" + element.media_path;
                    //console.log("viseoPath!!!!!!!!!!!!!!!!!!!");
                }
                console.log(self.videosURL[element.exe_id]);
            });

        }).catch(function (err) {
            console.log(err)
        });


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

        self. clickFeedback = function(exe){
            self.feedbackService.setID(exe);
            console.log(self.feedbackService.getExercise());
            $location.path('patFeedback')
        }

    }]);