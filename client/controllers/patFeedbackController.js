/**
 * Created by NOA-PC on 12/21/2017.
 */
angular.module("myApp")
    .controller('patFeedbackController', ['AuthenticationService','$http', '$location', '$window','$rootScope','$scope','programService','exerciseService','ipconfigService','patientFeedbackService', function (AuthenticationService,$http,$location, $window,$rootScope,$scope,programService,exerciseService,ipconfigService,patientFeedbackService ) {
        let self = this;
        self.feedbackService = patientFeedbackService;
        self.authService = AuthenticationService;
        self.nSuccRange = [];
        for (var i = 0; i <= self.feedbackService.getExercise().time_in_day; i++) {
            self.nSuccRange.push(i);
        };

        $scope.painSlider = {
            value: 0,
            options: {
                floor: 0,
                ceil:  10,
                showTicks: true,
                translate: function(value) {
                    if(value == 10) {
                        return '10 -כואב מאוד';
                    }
                    else if (value==0)
                    {
                        return '0 -לא כואב כלל';
                    }
                    else {
                        return value;
                    }
                },
            },
        };

        self.submit = function () {
            let date = Date.now();
            let req = {
                method: 'POST',
                url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/setPatientFeedback',
                headers: {
                    'Content-Type': "application/json"
                },
                data: {
                    "patUsername": self.authService.userId,
                    "date": date,
                    "exe": self.feedbackService.getExercise(),
                    "exeTitle": self.feedbackService.getExerciseTitle(),
                    "nSucc":self.nSucc,
                    "succLvl":self.succ,
                    "painLVvl":$scope.painSlider.value

                }
            };
            $http(req).then(function (ans) {
                console.log(ans);
                alert("המשוב התקבל");
                //console.log(self.videsPathes);
                $location.path('exercises')
            }).catch(function (err) {
                console.log("error: " + err)
            });

        };



    }]);