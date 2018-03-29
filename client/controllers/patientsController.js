/**
 * Created by NOA-PC on 12/21/2017.
 */

angular.module("myApp")
 .controller('patientsController', ['$route','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService','AuthenticationService', function ($route,$http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService,AuthenticationService   ) {
     let self = this;
     self.authService = AuthenticationService
     self.chosenPatient = "";
     self.videosURL = {};
     self.chosenExe = {};
     self.chosenProgram= "";

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

     self.isEven = function(patient)
     {
         if (self.chosenPatUsername == patient.username)
             return true;
         else
             return false;
     }
        self.clickUser = function(patient){
            self.chosenPatient = patient;
            console.log("chosen patient: " +  self.chosenPatient );
        };
     self.createProgram = function(patient){
         patientService.setID(patient);
         console.log("chosen patient: " +  patientService.getID());
     };
     self.patientProg = function(username){
         self.chosenPatUsername = username;
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

     };
     self.isBelongToProgram = function(exe,prog_id) {
         console.log("isBelong");
         if(exe.prog_id ==prog_id)
            {
                return true;
            }
            else {
                return false;
            }
     };
     self.clickExeDet = function(exe_id){
         console.log("exeDet");
         self.chosenExe[exe_id] = true;
         self.exercises.forEach(function (element) {
             if(element.exe_id != exe_id)
             {
                 self.chosenExe[element.exe_id] = false;
             }
         });

         console.log("exercise chosen: " + exe_id);
         console.log("exercise chosen: " +self.chosenExe[exe_id]);
     };
     self.isChosenProg = function(prog_id)
     {
         if(prog_id == self.chosenProgram)
         {
             return true;
         }
         else {
             return false;
         }
     };
     self.progDet = function(prog_id)
     {
         self.chosenProgram = prog_id;
         console.log("progDet");
         let req = {
             method: 'POST',
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getProgramExe',
             headers: {
                 'Content-Type': "application/json"
             },
             data: {
                 "prog_id": prog_id
             }
         };
         $http(req).then(function (ans) {
             self.exercises = ans.data;
             console.log("number of exe::::" + self.exercises.length)
             console.log(self.exercises);
             self.exercises.forEach(function (element) {
                 self.chosenExe[element.exe_id] = false;
                 if(element.media_path != null) {
                     //self.videosURL[element.exe_id] = "http://10.100.102.11:3000/api/mediaGet/"+element.media_path;
                     self.videosURL[element.exe_id] = "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + "/api/mediaGet/" + element.media_path;
                     //console.log("viseoPath!!!!!!!!!!!!!!!!!!!");
                 }
                 console.log(self.videosURL[element.exe_id]);
             });

         }).catch(function (err) {
             console.log(err)
         });
     }
 }]);

/*
 let req = {
 method: 'POST',
 url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getProgramExe',
 headers: {
 'Content-Type': "application/json"
 },
 data: {
 "prog_id": programService.getProgID()
 }
 };
 $http(req).then(function (ans) {
 self.exercises = ans.data;
 console.log("number of exe::::" + self.exercises.length)
 console.log(self.exercises);
 self.exercises.forEach(function (element) {
 self.chosenExe[element.exe_id] = false;
 if(element.media_path != null) {
 //self.videosURL[element.exe_id] = "http://10.100.102.11:3000/api/mediaGet/"+element.media_path;
 self.videosURL[element.exe_id] = "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + "/api/mediaGet/" + element.media_path;
 //console.log("viseoPath!!!!!!!!!!!!!!!!!!!");
 }
 console.log(self.videosURL[element.exe_id]);
 });

 }).catch(function (err) {
 console.log(err)
 });

 */