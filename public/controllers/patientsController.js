/**
 * Created by NOA-PC on 12/21/2017.
 */

angular.module("myApp")
 .controller('patientsController', ['$route','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService','AuthenticationService', function ($route,$http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService,AuthenticationService   ) {
     let self = this;
     self.authService = AuthenticationService
     self.chosenPatient = "";
     let req = {
         method: 'POST',
         url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getPhysioPatients',

         headers: {
             'Content-Type': "application/json"
         },
         data: {
             "physio": self.authService.userId
         }
     };
     $http(req).then(function (ans) {
         self.patients = ans.data;
        // self.programs = [];
        /* for (i = 0; i < progs.length; i++) {
             self.programs.push(progs.prog_id);
         }*/
         console.log(self.patients);

         //console.log(self.videsPathes);
     }).catch(function (err) {
         console.log(err)
     });

        self.clickUser = function(patient){
            self.chosenPatient = patient;
            console.log("chosen patient: " +  self.chosenPatient );
        };
     self.createProgram = function(patient){
         patientService.setID(patient);
         console.log("chosen patient: " +  patientService.getID());
     };
     self.patientProg = function(username){
         let req = {
             method: 'POST',
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getUserPrograms',
             headers: {
                 'Content-Type': "application/json"
             },
             data: {
                 "username": username
             }
         };
         $http(req).then(function (ans) {
             self.programs = ans.data;
             console.log(self.programs);

             //console.log(self.videsPathes);
         }).catch(function (err) {
             console.log(err)
         });
     };
     self.deleteProg = function(progID)
     {
         let req = {
             method: 'DELETE',
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/deleteProg',
             headers: {
                 'Content-Type': "application/json"
             },
             data: {
                 "prog_id": progID
             }
         };
         $http(req).then(function (ans) {
             console.log(ans);
            if(ans.status == "200")
            {
                alert("התכנית נמחקה");
                $route.reload();
            }
             //console.log(self.videsPathes);
         }).catch(function (err) {
             console.log(err)
         });

     }
 }]);