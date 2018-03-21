/**
 * Created by NOA-PC on 1/4/2018.
 */
angular.module("myApp")
/*.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService',
        function ($scope, $rootScope, $location, AuthenticationService) {
            // reset login status
            AuthenticationService.ClearCredentials();

            $scope.login = function () {
                $scope.dataLoading = true;
                AuthenticationService.Login($scope.username, $scope.password, function (response) {
                    if (response.data.success =='login') {
                        AuthenticationService.SetCredentials($scope.username, $scope.password);
                        $location.path('/');
                    } else {
                        $scope.error = response.message;
                        $scope.dataLoading = false;
                    }
                });
            };
        }]);*/


    .controller('LoginController',
        ['$location', 'AuthenticationService','FlashService','resetPasswordService','ipconfigService','$http',
            function ($location, AuthenticationService,FlashService,resetPasswordService,ipconfigService,$http) {
                // reset login status
                AuthenticationService.ClearCredentials();
                var self = this;
                self.isError = false;
                self.login = function () {
                    self.dataLoading = true;
                    AuthenticationService.Login(self.username, self.password, function (response) {
                        // if (response.data.success =='login') {
                        if (response.data.hasOwnProperty('err'))
                        {
                            self.isError = true;
                            self.error = response.data.err;
                            self.dataLoading = false;

                        } else {

                            AuthenticationService.SetCredentials(self.username, self.password);
                            $location.path('/');
                        }
                    });
                };

                self.resetPassword = function () {
                    resetPasswordService.setID(self.username);
                        let req = {
                            method: 'POST',
                            url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getTempPass',
                            headers: {
                                'Content-Type': "application/json"
                            },
                            data: {
                                "username": self.username,
                            }
                        };
                        $http(req).then(function (ans) {
                            console.log(ans);
                            alert("סיסמא זמנית נשלחה למייל השמור במערכת");
                            $location.path('/resetPassword');
                        }).catch(function (err) {
                            alert("error");
                        })
                    };


            }])