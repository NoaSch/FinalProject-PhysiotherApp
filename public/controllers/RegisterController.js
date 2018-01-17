/**
 * Created by NOA-PC on 1/13/2018.
 */

angular.module('myApp')
    .controller('RegisterController',['$location', 'AuthenticationService','FlashService','$http','ipconfigService','PhysiotherapistModel',
            function ($location, AuthenticationService,FlashService,$http,ipconfigService,PhysiotherapistModel) {
                //Get the physiotherapiss
                var self = this;
                self.therapists = [];
                $http.get('http://'+ipconfigService.getIP()+":"+ipconfigService.getPort()+'/api/GetAllTherapists')
                    .then(function (response) {
                         var physios = response.data;
                        //////continue Here to initialize the physiothrapysts!!!!
                        physios.forEach(function(item) {
                             physio = new PhysiotherapistModel(item.username,item.first_name,item.last_name,item.phone,item.mail);
                             console.log(physio)
                             self.therapists.push(physio);
                        });
                        ////
                        ////
                            }, function (errResponse) {
                                console.error(errResponse);
                            });


                    var self = this;
                 self.register = function() {
                    alert("inReg")
                    self.dataLoading = true;
                    self.authService = AuthenticationService;
                    var req = {
                        method: 'POST',
                        url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/register',
                        headers: {
                            'Content-Type': "application/json"
                        },
                        /*
                         "username": "user3",
                         "password": "user3",
                         "firstName": "user3Fname",
                         "lastName": "user3Lname",
                         "phone": "0509999999",
                         "mail": "mail@gmail.com",
                         "physiotherapist_username": "p1",
                         "isPhysio":false
                         */
                        data: {
                            "username": self.username,
                            "password":self.password ,
                            "firstName": self.firstName,
                            "lastName": self.lastName,
                            "mail": self.mail,
                            "phone": self.phone,
                            "physiotherapist_username": self.chosenTherapist,
                            "isPhysio": self.physioChecked
                        }
                    }
                    $http(req).then(function (response) {
                        //console.error($scope.selectedVslues);
                        var res = response.data;
                        if (response.data.hasOwnProperty('err'))
                        {
                            self.isError = true;
                            self.error = response.data.err;
                            self.dataLoading = false;

                        }
                        else {
                        self.dataLoading = false;
                        alert("inserted");
                        $location.path('/');
                    }}, function (errResponse) {
                        console.error('Error while register');
                    });

                }
            }]);



