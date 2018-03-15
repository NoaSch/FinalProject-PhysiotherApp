
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
         console.log(self.programs);

         //console.log(self.videsPathes);
     }).catch(function (err) {
         console.log(err)
     });

        self.clickProg = function(progid){
            programService.setProgID(progid);
            console.log("scope prog: " + programService.getProgID());
        }
 }]);