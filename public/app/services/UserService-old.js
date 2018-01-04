/**
 * Created by Lera on 31/07/2017.
 */
angular.module('myApp')
    .factory('UserService', ['$http', function($http) {
        let service = {};
        service.notLoggedIn = true;
        service.userId="guest";
        service.lastLogin="";
        service.token="";
        service.login = function(user) {
            return $http.post('/login', user)
                .then(function(response) {
                    let token = response.data;
                    $http.defaults.headers.common = {
                        'my-Token': token,
                        'user' : user.username
                    };
                    service.notLoggedIn = false;
                    return Promise.resolve(response);
                })
                .catch(function (e) {
                    return Promise.reject(e);
                });
        };
        return service;
    }]);