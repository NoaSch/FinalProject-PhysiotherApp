/**
 * Created by NOA-PC on 3/18/2018.
 */
//handle with changeing user's pass
angular.module("myApp")
    .controller('changeUserPassController', ['regexService','resetPasswordService','AuthenticationService','$http', '$location', '$window','$rootScope','$scope','ipconfigService', function (regexService,resetPasswordService,AuthenticationService,$http,$location, $window,$rootScope,$scope,ipconfigService ) {
        let self = this;
        self.dataLoading = false;
        self.regexService = regexService;
        self.authService = AuthenticationService;

        //function to check the two pass are same
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
        //send update request to the server
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
                    "username": self.username,
                    "newPass": self.pass1
                }
            };
            $http(req).then(function (ans) {
                if(ans.data.status =="update" ) {
                    console.log(ans);
                    self.dataLoading = false;
                    alert("הסיסמא עודכנה ");
                    $location.path('/');
                }
                else if(ans.data.status =="usernotfound"){
                    alert("שם משתמש לא קיים");
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
        };

    }]);