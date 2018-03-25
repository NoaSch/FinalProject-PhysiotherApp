/**
 * Created by NOA-PC on 12/21/2017.
 */

angular.module("myApp")
 .controller('messagesController', ['$route','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService','AuthenticationService', function ($route,$http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService,AuthenticationService   ) {
     let self = this;
     self.inbox  = {};
     self.authService = AuthenticationService;
     let req = {
         method: 'POST',
         url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getOutbox',

         headers: {
             'Content-Type': "application/json"
         },
         data: {
             "username": self.authService.userId
         }
     };
     $http(req).then(function (ans) {
         self.outbox = ans.data;
         console.log(self.outbox);

         let reqInbox = {
             method: 'POST',
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getInbox',
             headers: {
                 'Content-Type': "application/json"
             },
             data: {
                 "username": self.authService.userId
             }
         };
         $http(reqInbox).then(function (ans) {
             self.messages = ans.data;
             console.log(self.messages);

         }).catch(function (err) {
             console.log(err)
         });


     }).catch(function (err) {
         console.log(err)
     });



 }]);