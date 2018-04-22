
angular.module("myApp")
 .controller('programsController', ['AuthenticationService','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','ipconfigService', function (AuthenticationService,$http,$location, $window,$scope,$rootScope,programService,exerciseService,ipconfigService ) {
     let self = this;
     self.authService = AuthenticationService;


     let req = {
         method: 'POST',
         url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getUserPrograms',
         headers: {
             'Content-Type': "application/json"
         },
         data: {
             "username": self.authService.userId
         }
     };
     $http(req).then(function (ans) {
         self.programs = ans.data;

     }).catch(function (err) {
         alert(err.message);
     });

        self.clickProg = function(progid){
            programService.setProgID(progid);
        };
     self.hasNoExe = function()
     {
         if(self.programs.length == 0)
         {
             return true;
         }
         else
         {
             return false;
         }
     };
 }]);