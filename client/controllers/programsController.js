//handle patien's programs list

angular.module("myApp")
 .controller('programsController', ['AuthenticationService','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','ipconfigService', function (AuthenticationService,$http,$location, $window,$scope,$rootScope,programService,exerciseService,ipconfigService ) {
     let self = this;
     self.authService = AuthenticationService;
     self.dataLoading = true;
    //get patien's programs
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
         self.dataLoading = false;


     }).catch(function (err) {
         alert(err.message);
         self.dataLoading = false;
     });

        self.clickProg = function(progid){
            programService.setProgID(progid);
        };
        //check if program dowsn't have exercises
     self.hasNoExe = function()
     {
         if(self.dataLoading == false &&(self.programs == null || self.programs.length == 0))
         {
             return true;
         }
         else
         {
             return false;
         }
     };
 }]);