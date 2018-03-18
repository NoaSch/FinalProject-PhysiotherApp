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
        ['$location', 'AuthenticationService','FlashService','resetPasswordService',
            function ($location, AuthenticationService,FlashService,resetPasswordService) {
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
                    alert(self.username);
                    $location.path('/resetPassword')
                }
            }])