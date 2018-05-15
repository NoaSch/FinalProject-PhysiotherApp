/**
 * Created by NOA-PC on 1/4/2018.
 */
//service that deal with the authentication
'use strict';

angular.module('myApp')
    .factory('AuthenticationService',

        ['$http', '$cookieStore', '$rootScope', '$timeout','ipconfigService',
            function ($http, $cookieStore, $rootScope, $timeout,ipconfigService) {
                var service = {};
                service.loggedIn = false;
                service.userId="אורח";
                service.userFirstName="אורח";
                service.PhysioUsername = "";
                service.isAdmin=false;
                service.isPhysio=false;
                service.Login = function (username, password, callback) {


                    //send a request for authtentication to the server
                    $http.post("http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/validate', { username: username, password: password })
                        .then(function (response) {
                            if (!response.data.hasOwnProperty('err'))
                            {
                                service.isPhysio = response.data[0].isPhysio;
                                if(username == 'admin')
                                {
                                    service.userFirstName = "מנהל";
                                    service.isAdmin = true;
                                }
                                else {
                                    service.userFirstName = response.data[0].first_name;
                                    service.isAdmin = false;
                                    if(service.isPhysio== false)
                                    {
                                        service.PhysioUsername = response.data[0].physiotherapist_username;
                                    }
                                }
                            }
                           callback(response);
                       });

                };
                service.SetCredentials = function (username) {
                    $rootScope.globals = {
                        currentUser: {
                            username: username,
                        }
                    };
                    //get the user first name
                    service.userId = username;
                    service.loggedIn = true;
                    //$http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
                    $cookieStore.put('globals', $rootScope.globals);
                };
                //return true if an user is  a patient
                service.isPatient = function()
                {
                    if(service.isPhysio == true || service.isAdmin== true||service.userId== "guest"||service.userId =="אורח")
                    {
                       return false;
                    }
                    else {
                        return true;
                    }
                };
                //clear the current user's credintial
                service.ClearCredentials = function () {
                    service.loggedIn = false;
                    service.userId="guest";
                    service.isAdmin = false;
                    $rootScope.globals = {};
                    $cookieStore.remove('globals');
                    $http.defaults.headers.common.Authorization = 'Basic ';

                };

                return service;
            }])

