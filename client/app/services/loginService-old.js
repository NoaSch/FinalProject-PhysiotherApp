/**
 * Created by Lera on 24/06/2017.
 */
app.factory('loginService', function(UserService, $http,$location, $window, cookiesService){

    let service= {};
    service.login = function (userid, userpass) {
            var req = {
                method: 'POST',
                url: 'http://localhost:4000/Login',
                headers: {
                    'Content-Type': "application/json"
                },
                data: {
                    "username": userid,
                    "password":userpass
                }
            }


            $http(req).then(function (ans) {
                var res = ans.data;
                if (Object.values(res)[0] === "Login Succeed") {

                        cookiesService.setNewLoginDate();

                    $window.location.href = '/#/';
                }
                else
                {

                }


            }, function (errResponse) {
                console.error('Error while login');
            });
        }
        return service;
    });
