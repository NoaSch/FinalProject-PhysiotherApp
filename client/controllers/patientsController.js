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
     self.moreMsgInCor = {};
     self.correspondences = {};
     self.rep = {};
     self.corsOrder= {};

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
     self.refresh = function() {
         console.log("reload");
         $route.reload();
     };
        self.clickUser = function(patient){
            self.clickedmsg = false;
            self.chosenPatient = patient;
            console.log("chosen patient: " +  self.chosenPatient );
        };
     self.createProgram = function(patient){
         self.clickedmsg = false;
         patientService.setID(patient);
         console.log("chosen patient: " +  patientService.getID());
         $location.path('/newProgram');
     };
     self.patientProg = function(username){
         self.clickedmsg = false;

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
             //console.log(self.programs);

             //console.log(self.videsPathes);
         }).catch(function (err) {
             console.log(err)
         });
     };
     self.deleteProg = function(progID)
     {
         self.clickedmsg = false;
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
            // console.log(ans);
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
         //console.log("isBelong");
         if(exe.prog_id ==prog_id)
            {
                return true;
            }
            else {
                return false;
            }
     };
     self.clickExeDet = function(exe_id){
         self.clickedmsg = false;
         //console.log("exeDet");
         self.chosenExe[exe_id] = true;
         self.exercises.forEach(function (element) {
             if(element.exe_id != exe_id)
             {
                 self.chosenExe[element.exe_id] = false;
             }
         });

         //console.log("exercise chosen: " + exe_id);
         //console.log("exercise chosen: " +self.chosenExe[exe_id]);
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
     self.isChosenMsgPat = function(patientUsename)
     {
         if((patientUsename == self.chosenPatMsgUsername) && (self.clickedmsg == true))
         {
             console.log("show for " + patientUsename);
             return true;
         }
         else {
             return false;
         }
     };
     self.progDet = function(prog_id)
     {
         self.clickedmsg = false;
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


     self.getMessages = function(patientUsername)
     {
         console.log("getMessage " + patientUsername);
         self.moreMsgInCor = {};
         self.correspondences = {};
         self.rep = {};
         self.clickedmsg = true;
         self.chosenPatMsgUsername = patientUsername;
         let req = {
             method: 'POST',
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getAllMessagesBetweenTwo',

             headers: {
                 'Content-Type': "application/json"
             },
             data: {
                 "user1": self.authService.userId,
                 "user2": patientUsername
             }
         };
         $http(req).then(function (ans) {
             self.messages = ans.data;

             ///get the correspondence and tieles
             self.messages.forEach(function(element)
             {
                 if (element.type == "feedback")
                 {
                     console.log("feedback");
                     let fixMsg = "";
                     let strArr = element.msg_content.split(",");
                     for (i = 0; i < strArr.length; i++) {
                         fixMsg += strArr[i] + "\n";
                     }
                     element.msg_content = fixMsg;
                     console.log(element.msg_content);
                 }
                 let cor_id= element.correspondence_id;
                 if(cor_id in self.corsOrder)
                 {
                     self.correspondences[self.corsOrder[cor_id]].push(element);
                 }
                 else {
                     let next = Object.keys(self.corsOrder).length
                     console.log("length: "+ next);
                     self.corsOrder[cor_id] = next;
                     console.log("corid:" +cor_id +" , order: "+next);
                     self.correspondences[self.corsOrder[cor_id]] = [];
                     console.log("length: "+ next);
                     self.correspondences[self.corsOrder[cor_id]].push(element);
                     //console.log(element);
                     self.moreMsgInCor[cor_id]= false;
                     self.rep[cor_id]= false;
                 }

             });
             /*self.messages.forEach(function(element)
             {
                 if (element.type == "feedback")
                 {
                     console.log("feedback");
                     let fixMsg = "";
                     let strArr = element.msg_content.split(",");
                     for (i = 0; i < strArr.length; i++) {
                         fixMsg += strArr[i] + "\n";
                     }
                     element.msg_content = fixMsg;
                     console.log(element.msg_content);
                 }
                 let cor_id= element.correspondence_id;
                 if(cor_id in self.correspondences)
                 {
                     self.correspondences[cor_id].push(element);
                 }
                 else {
                     self.correspondences[cor_id] = [];
                     self.correspondences[cor_id].push(element);
                     self.moreMsgInCor[cor_id]= false;
                     self.rep[cor_id]= false;
                 }

             });*/
             //console.log("cors");
             //console.log(self.correspondences);
             //console.log(Object.keys(self.correspondences).length)
         }).catch(function (err) {
             console.log(err)
         });
     }

     self.more = function(cor_id)
     {
         console.log("cor_id: " + cor_id);
         console.log(self.moreMsgInCor);

         self.moreMsgInCor[cor_id] = true;
         console.log(self.moreMsgInCor);

         for (index in self.correspondences)
         {
             console.log("index: "+index);
             if(index != cor_id)
             {
                 console.log(""+index +" ne " + cor_id );
                 self.moreMsgInCor[index]  = false;
             }
         };
         console.log("more");
         console.log(self.moreMsgInCor);

     };

     self.notFirst = function(msg,cor)
     {
         if(msg == cor[0]) {
             return false;
         }
         else {
             return true;
         }
     };
     self.reply = function(cor)
     {
         console.log("cor: "+cor);
         //create new message
         //check who is the other person and he will be the recipient
         self.rep[cor.correspondence_id] = true;
     };
     self.sendNewnewMsg = function()
     {
         ///call /api/sendMessage
         let reqMsg = {
             method: 'POST',
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/sendMessage',

             headers: {
                 'Content-Type': "application/json"
             },
             data: {
                 "isNew": true,
                 "to": self.authService.chosenPatMsgUsername,
                 "from": self.authService.userId,
                 "date":Date.now(),
                 "msgtitle":self.msgTitle,
                 "content":self.newMsg
             }
         };
         $http(reqMsg).then(function (ans) {
             alert("ההודעה נשלחה");
             self.newMsg = "";


         }).catch(function(err)
         {
             console.log(err);
             alert("שגיאה");
         })
     };

     self.sendRep = function (cor)
     {
         let reqMsg = {
             method: 'POST',
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/sendMessage',

             headers: {
                 'Content-Type': "application/json"
             },
             data: {
                 "isNew": false,
                 "cor_id": cor.correspondence_id,
                 "to": self.chosenPatMsgUsername,
                 "from": self.authService.userId,
                 "msgtitle":cor.title,
                 "date":Date.now(),
                 "content":self.repMsg
             }
         };
         $http(reqMsg).then(function (ans) {
             alert("ההודעה נשלחה");
             self.repMsg = "";

         }).catch(function(err)
         {
             console.log(err);
             alert("שגיאה");
         })
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