/**
 * Created by NOA-PC on 1/13/2018.
 */
//handle registration form
angular.module('myApp')
    .controller('RegisterController',['regexService','$window','$route','$location', 'AuthenticationService','Upload','FlashService','$http','ipconfigService','PhysiotherapistModel',
            function (regexService,$window,$route,$location, AuthenticationService,Upload,FlashService,$http,ipconfigService,PhysiotherapistModel) {
                //Get the physiotherapiss
                var self = this;
                self.regexService = regexService;
                self.therapists = [];
                self.authService = AuthenticationService;
                //gets list of all physiotherpists
                $http.get('http://'+ipconfigService.getIP()+":"+ipconfigService.getPort()+'/api/GetAllTherapists')
                    .then(function (response) {
                         var physios = response.data;
                        physios.forEach(function(item) {
                             physio = new PhysiotherapistModel(item.username,item.first_name,item.last_name,item.phone,item.mail);
                             self.therapists.push(physio);
                        });
                            }, function (errResponse) {
                                console.error(errResponse);
                            });

                //send the new user's details to the server
                 self.register = function(valid) {
                     if(!valid)
                     {
                         alert("נא הזן את כל השדות באופן חוקי");
                     }
                     else {
                         if (self.physioChecked) {
                             self.dataLoading = true;
                             var req = {
                                 method: 'POST',
                                 url: "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + '/api/register',
                                 headers: {
                                     'Content-Type': "application/json"
                                 },
                                 data: {
                                     "username": self.username,
                                     "password": self.password,
                                     "firstName": self.firstName,
                                     "lastName": self.lastName,
                                     "mail": self.mail,
                                     "phone": self.phone,
                                     "physiotherapist_username": self.chosenTherapist,
                                     "isPhysio": self.physioChecked
                                 }
                             }
                             $http(req).then(function (response) {
                                 var res = response.data;
                                 if (response.data.hasOwnProperty('err')) {
                                     self.isError = true;
                                     self.error = response.data.err;
                                     self.dataLoading = false;

                                 }
                                 else {
                                     self.dataLoading = false;
                                     alert("הרישום הצליח");
                                     self.username = "";
                                     self.password = "";
                                     self.firstName = "";
                                     self.lastName = "";
                                     self.mail = "";
                                     self.phone = "";
                                     self.chosenTherapist = ""
                                     $route.reload();
                                     //$location.path('/');
                                 }
                             }, function (errResponse) {
                                 alert('שגיאה בהרשמה');
                             });
                         }
                         else {
                             if (self.chosenTherapist == null || self.chosenTherapist == "") {
                                 alert("יש לבחור פיזיותרפיסט מטפל");
                             }
                             else if (self.age == null) {
                                 alert("יש להזין גיל");
                             }
                             else {
                                 if (self.file) {
                                     if (self.file.type == "image/jpeg" || self.file.type == "image/png") {
                                         self.upload(self.file);
                                     }
                                     else {
                                         alert("שגיאה: ניתן להעלות תמונות בפורמט jpg,jpeg,png בלבד");
                                     }
                                 }
                                 else {
                                     self.dataLoading = true;
                                     var req = {
                                         method: 'POST',
                                         url: "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + '/api/registerNoPhoto',
                                         headers: {
                                             'Content-Type': "application/json"
                                         },
                                         data: {
                                             "username": self.username,
                                             "password": self.password,
                                             "firstName": self.firstName,
                                             "lastName": self.lastName,
                                             "mail": self.mail,
                                             "phone": self.phone,
                                             "physiotherapist_username": self.chosenTherapist,
                                             "isPhysio": self.physioChecked,
                                             "age": self.age,
                                             "diagnosis": self.diagnosis
                                         }
                                     }
                                     $http(req).then(function (response) {
                                         var res = response.data;
                                         if (response.data.hasOwnProperty('err')) {
                                             self.isError = true;
                                             self.error = response.data.err;
                                             self.dataLoading = false;

                                         }
                                         else {
                                             self.dataLoading = false;
                                             alert("הרישום הצליח");
                                             self.username = "";
                                             self.password = "";
                                             self.firstName = "";
                                             self.lastName = "";
                                             self.mail = "";
                                             self.phone = "";
                                             self.chosenTherapist = ""
                                             $route.reload();
                                             //$location.path('/');
                                         }
                                     }, function (errResponse) {
                                         alert('שגיאה בהרשמה');
                                     });

                                 }
                             }

                         }
                     }
                };
                 //chack if logged user is admin
                self.isAdmin = function()
                {
                    return self.authService.isAdmin;
                };
                //send picture and details to the server for registration
                self.upload = function (file) {
                    self.finishLoad = false;
                    //self.cuurDate
                    Upload.upload({
                        url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/register', //webAPI exposed to upload the file
                        data:{
                            file:file,
                            "username": self.username,
                            "password":self.password ,
                            "firstName": self.firstName,
                            "lastName": self.lastName,
                            "mail": self.mail,
                            "phone": self.phone,
                            "physiotherapist_username": self.chosenTherapist,
                            "isPhysio": self.physioChecked,
                            "age": self.age,
                            "diagnosis":self.diagnosis
                        } //pass file as data, should be user ng-model
                    }).then(function (response) {
                        if (response.data.hasOwnProperty('err'))
                        {
                            self.isError = true;
                            self.error = response.data.err;
                            self.dataLoading = false;

                        }//upload function returns a promise
                        else{ //validate success\\
                            self.file = null;
                            self.progress = "";
                            self.finishLoad = true;
                            alert("הרישום הצליח");
                            self.username ="";
                            self.password="";
                            self.firstName="";
                            self.lastName="";
                            self.mail="";
                            self.phone="";
                            self.chosenTherapist=""
                            $route.reload();

                        }
                    }, function (resp) { //catch error
                        $window.alert('Error status: ' + resp.status);
                    }, function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        self.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
                    });

                };

            }]);



