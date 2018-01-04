/**
 * Created by NOA-PC on 12/21/2017.
 */

angular.module("myApp")
 .controller('patientsController', ['$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService','AuthenticationService', function ($http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService,AuthenticationService   ) {
     let self = this;
     self.authService = AuthenticationService
     //self.userName = "noa";
     //let ip = "192.168.1.15";
     //let port = 3000;
     //let ipAndProt = "http://10.100.102.13:4000";
     self.chosenPatient = "";
     //self.videoURL = "http://" + ip + ":" + port + "/api/video/" + testURL;
     //console.log("videoURL"+self.videoURL);
     //let req = "http://192.168.1.15:4001/api/GetAllVideosPathes";
     let req = {
         method: 'POST',
         //url: 'http://132.73.201.132:3000/api/getUserPrograms',
         //url: 'http://10.100.102.11:3000/api/getUserPrograms',
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
     }//
 }]);