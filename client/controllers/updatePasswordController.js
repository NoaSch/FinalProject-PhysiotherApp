/**
 * Created by NOA-PC on 3/18/2018.
 */
angular.module("myApp")
    .controller('updatePasswordController', ['regexService','resetPasswordService','AuthenticationService','$http', '$location', '$window','$rootScope','$scope','ipconfigService', function (regexService,resetPasswordService,AuthenticationService,$http,$location, $window,$rootScope,$scope,ipconfigService ) {
        let self = this;
        self.dataLoading = false;
        self.regexService = regexService;
        self.authService = AuthenticationService;

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
                url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/updateNewPassword',
                headers: {
                    'Content-Type': "application/json"
                },
                data: {
                    "username": self.authService.userId,
                    "oldPass":  self.oldPass,
                    "newPass": self.pass1
                }
            };
            $http(req).then(function (ans) {
                if(ans.data.status =="update" ) {
                    console.log(ans);
                    self.dataLoading = false;
                    alert("הסיסמא עודכנה ");
                    $location.path('/login');
                }
                else if(ans.data.status =="wrong" ) {
                    alert("שם משתמש או סיסמא לא נכונים");
                    self.dataLoading = false;

                }
                else {
                    alert("שגיאה בלתי צפוייה");
                    self.dataLoading = false;
                }

            }).catch(function (err) {
                alert("שגיאה");
                self.dataLoading = false;

            })
          //call /api/updatePassword
        };

    }]);