/**
 * Created by NOA-PC on 3/18/2018.
 */
angular.module("myApp")
    .controller('resetPasswordController', ['resetPasswordService','AuthenticationService','$http', '$location', '$window','$rootScope','$scope','ipconfigService', function (resetPasswordService,AuthenticationService,$http,$location, $window,$rootScope,$scope,ipconfigService ) {
        let self = this;
        self.trueTemp = false;
        self.dataLoading = false;
        self.authService = AuthenticationService;
        self.checkTemp = function () {
            self.dataLoading = true;
            let req = {
                method: 'POST',
                url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/validateTempPass',
                headers: {
                    'Content-Type': "application/json"
                },
                data: {
                    "username": resetPasswordService.getID(),
                    "tempPass": self.tempPass
                }
            };
            $http(req).then(function (ans) {
                //console.log(ans);
                if(ans.data.status =="valid" ) {
                    self.dataLoading = false;
                    self.trueTemp = true;
                }
                else {
                    self.dataLoading = false;
                    alert("סיסמא זמנית נכונה או לא בתוקף");


                }
            }).catch(function (err) {
                alert("error: "+err.message);
            })
        };

        //function to check the two pass are same- use ng-show

        self.passwordDifferent = function ()
        {

            if(self.pass1 == self.pass2)
            {
                return false;
            }
            else {
                return true;
            }
        }
        self.updatePass = function()
        {
            self.dataLoading = true;

            let req = {
                method: 'POST',
                url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/updatePassword',
                headers: {
                    'Content-Type': "application/json"
                },
                data: {
                    "username": resetPasswordService.getID(),
                    "newPass": self.pass1
                }
            };
            $http(req).then(function (ans) {
                console.log(ans);
                self.dataLoading = false;
                alert("הסיסמא עודכנה");
                $location.path('/login');
            }).catch(function (err) {
                alert("שגיאה");
            })
          //call /api/updatePassword
        };

    }]);