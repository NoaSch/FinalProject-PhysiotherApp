/**
 * Created by NOA-PC on 1/13/2018.
 */

angular.module('myApp')
    .controller('RegisterController',['$location', 'AuthenticationService','FlashService','$http',
            function ($location, AuthenticationService,FlashService,$http) {

                var self = this;
                self.register = function() {
                    alert("inReg")
                    self.dataLoading = true;
                    var req = {
                        method: 'POST',
                        url: 'http://localhost:4000/api/register',
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
                            "physiotherapist_username": self.physio_name,
                            "isPhysio": self.physioChecked
                        }
                    }
                    $http(req).then(function (response) {
                        //console.error($scope.selectedVslues);
                        var res = response.data;
                        /*if (Object.values(res)[0] === "Inserted"){
                            alert("Registration Complete, Go to Login Page");
                            $location.path('/login');
                        }
                        else if (Object.values(res)[0]=== "Username already exists")  {
                            alert("Username already exists");
                        }
                        else {
                            alert(Object.values(res)[0]);

                        }*/
                        self.dataLoading = false;

                        alert("inserted");
                        $location.path('/');
                    }, function (errResponse) {
                        console.error('Error while register');
                    });

                }
            }]);



