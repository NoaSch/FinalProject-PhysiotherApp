/**
 * Created by NOA-PC on 1/4/2018.
 */
//handle with the authentication
angular.module("myApp")
    .controller('LoginController',
        ['regexService','$location', 'messagesService','AuthenticationService','resetPasswordService','ipconfigService','$http',
            function (regexService,$location, messagesService,AuthenticationService,resetPasswordService,ipconfigService,$http) {
                // reset login status
                AuthenticationService.ClearCredentials();
                var self = this;
                self.isError = false;
                self.regexService = regexService;
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

                            AuthenticationService.SetCredentials(self.username);
                           /* if(AuthenticationService.isPatient()==true) {
                                let req = {
                                    method: 'POST',
                                    url: "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + '/api/getNumNewMessages',
                                    headers: {
                                        'Content-Type': "application/json"
                                    },
                                    data: {
                                        "username": self.username,
                                    }
                                };
                                $http(req).then(function (ans) {
                                    messagesService.setNumNew(ans.data[0]);
                                }).catch(function(error)
                                {
                                    alert("שגיאה");
                                })

                            }*/
                            $location.path('/');
                        }
                    });
                };

                self.resetPassword = function () {
                    self.dataLoading = true;
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
                            // console.log(ans);
                            if (ans.data.err_desc == "mail not found")
                            {
                                self.dataLoading = false;

                                alert("לא נמצא מייל עבור המשתמש");

                            }
                            else {
                                self.dataLoading = false;

                                alert("סיסמא זמנית נשלחה למייל השמור במערכת");

                                $location.path('/resetPassword');
                            }
                        }).catch(function (err) {
                            alert("error");
                        })
                    };


            }])