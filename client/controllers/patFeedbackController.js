chosenExe = undefined;
/**
 * Created by NOA-PC on 12/21/2017.
 */
angular.module("myApp")
    .controller('patFeedbackController', ['$http', '$location', '$window','$rootScope','$scope','programService','exerciseService','ipconfigService','patientFeedbackService', function ($http,$location, $window,$rootScope,$scope,programService,exerciseService,ipconfigService,patientFeedbackService ) {
        let self = this;
        self.feedbackService = patientFeedbackService;

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
            alert($scope.painSlider.value)
        };



    }]);