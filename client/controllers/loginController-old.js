/**
 * Created by Lera on 24/06/2017.
 */

angular.module("myApp")
    .controller('loginController', function(UserService, $http,$location, $window, cookiesService, $scope){
        var vm = this;
        //vm.user = new UserModel();
        vm.loginState = false;
        vm.message = "";
        vm.message2="";
        vm.message3="";
        vm.Forget=false;
        vm.hide=true;

        vm.login = function () {

            var req = {
                method: 'POST',
                url: 'http://localhost:4000/Login',
                headers: {
                    'Content-Type': "application/json"
                },
                data: {
                    "username": vm.Id,
                    "password":vm.Password
                }
            }


            $http(req).then(function (ans) {
                var res = ans.data;
                if (Object.values(res)[0] === "Fail User Name") {
                    //  if (res.result === "Login Fail"|| res.result === "the username  is Not exist") {
                    UserService.notLoggedIn=true;
                    vm.loginState = false;
                    vm.message = "Login Failed- Wrong User Name";
                    //vm.message = "Login Failed- Wrong Id or Password";
                }
                else if (Object.values(res)[0] === "Fail Password"){
                    UserService.notLoggedIn=true;
                    vm.loginState = false;
                    vm.message = "Login Failed- Wrong Password";

                }
                else
                {
                    var Q=Object.values(res)[0];
                    vm.q1=Object.values(Q)[0];
                    vm.loginState = true;
                    vm.message = "Login Succeeded";
                    //vm.user = ans;
                    UserService.notLoggedIn=false;
                    UserService.userId=vm.Id;
                    UserService.token=Object.values(res)[0];

                    var cookieId = cookiesService.getCookie(vm.Id);
                    if (!cookieId) {
                        cookiesService.addNewCookies(vm.Id,vm.Password);
                    }
                    else{

                        cookiesService.setNewLoginDate();
                    }
                    // $location.path('/home');
                    $window.location.href = '/#/';

                }


            }, function (errResponse) {
                console.error('Error while login');
            });
        }

        vm.ForgetPassword = function (){
            vm.Forget=true;
            var req = {
                method: 'POST',
                url: 'http://localhost:4000/ForgetPassword',
                headers: {
                    'Content-Type': "application/json"
                },
                data: {
                    "username": vm.Id
                }
            }

            $http(req).then(function (ans) {
                var res = ans.data;

                if (res.length==0){
                    vm.hide=true;
                    vm.message3="Username incorrect";
                }

                else {
                    vm.hide=false;
                    vm.message3="";
                    var Q=Object.values(res)[0];
                    vm.q1=Object.values(Q)[0];
                    vm.q2=Object.values(Q)[1];
                }

            }, function (errResponse) {
                console.error('Error while forget pass');
            });
        }

        vm.RestorePassword=function () {
            vm.Forget=true;
            var req = {
                method: 'POST',
                url: 'http://localhost:4000/RestorePassword',
                headers: {
                    'Content-Type': "application/json"
                },
                data: {
                    "username": vm.Id,
                    "Ans1": vm.ans1,
                    "Ans2": vm.ans2
                }
            }
            $http(req).then(function (ans) {
                var res = ans.data;
                if (Object.values(res)[0] === "The Restore Password Faild") {
                    vm.message2="The Restore Password Faild";
                }
                else{
                    vm.message2="The Password is: " +Object.values(res)[0];

                }

            }, function (errResponse) {
                console.error('Error while restore pass');
            });
        }

    });