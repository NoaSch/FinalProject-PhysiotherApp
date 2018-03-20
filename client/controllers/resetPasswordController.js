/**
 * Created by NOA-PC on 3/18/2018.
 */
angular.module("myApp")
    .controller('resetPasswordController', ['resetPasswordService','$http', '$location', '$window','$rootScope','$scope','ipconfigService', function (resetPasswordService,$http,$location, $window,$rootScope,$scope,ipconfigService ) {
        let self = this;
        self.trueTemp = false;


        self.checkTemp = function () {
            let req = {
                method: 'POST',
                url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/validateTempPass',
                headers: {
                    'Content-Type': "application/json"
                },
                data: {
                    "username": resetPasswordService.resetPasswordService,
                }
            };
            $http(req).then(function (ans) {
                console.log(ans);
                self.trueTemp = true;
            }).catch(function (err) {
                alert("error");
            })
        };

        //function to check the two pass are same- use ng-show

        self.updatePass = function()
        {
          //call /api/updatePassord
        };

    }]);