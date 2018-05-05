/**
 * Created by NOA-PC on 12/21/2017.
 */

angular.module("myApp")
 .controller('patientsController', ['regexService','$route','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService','AuthenticationService', function (regexService,$route,$http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService,AuthenticationService   ) {
     let self = this;
     self.authService = AuthenticationService
     self.videosURL = {};
     self.chosenExe = {};
     self.chosenProgram= "";
     self.moreMsgInCor = {};
     self.correspondences = {};
     self.rep = {};
     self.corsOrder= {};
     self.clickedDet = false;
     self.clickedPatDet = false;
     self.pics = {};
     self.regexService = regexService;
self.dataLoading = true;
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
         self.patients.forEach(function (element) {
             if (element.pic_url != null) {
                 self.pics[element.username] = "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + "/api/getPic/" + element.pic_url;
             }
         });
         self.dataLoading = false;
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

         $route.reload();
     };
        self.clickUser = function(patientUsername){
            self.clickedmsg = false;
            self.clickedPatDet = true;
            self.clickedDet = false;

            self.chosenPatUsername = patientUsername;
            console.log("chosen patient: " +  self.chosenPatient );
        };
     self.createProgram = function(patient){
         self.clickedPatDet = false;
         self.clickedmsg = false;
         self.clickedDet = false;
         patientService.setID(patient);
         console.log("chosen patient: " +  patientService.getID());
         $location.path('/newProgram');
     };
     self.patientProg = function(username){
         self.dataLoading = true;
         self.clickedmsg = false;
         self.clickedDet = true;
         self.clickedPatDet = false;


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
             self.dataLoading = false;
         }).catch(function (err) {
             alert(err.message);
             self.dataLoading = false;

         });
     };
     self.deleteProg = function(progID)
     {

         self.clickedPatDet = false;

         self.clickedmsg = false;
         deleteUser = $window.confirm('האם למחוק את התכנית?');

         if(deleteUser) {
             let req = {
                 method: 'DELETE',
                 url: "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + '/api/deleteProg',
                 headers: {
                     'Content-Type': "application/json"
                 },
                 data: {
                     "prog_id": progID
                 }
             };
             $http(req).then(function (ans) {
                 if (ans.data.error_code === 0)//validate success\\
                 {
                     alert("התכנית נמחקה");
                     $route.reload();
                 }
                 else {
                     alert("error");
                 }
             }).catch(function (err) {
                 alert(err.message)
             });
         }
     };
     self.isBelongToProgram = function(exe,prog_id) {
         if(exe.prog_id ==prog_id)
            {
                return true;
            }
            else {
                return false;
            }
     };
     self.notHaveMessages = function(username)
     {
         if(self.dataLoading== false &&(self.messages == null ||  self.messages.length ==0)) {
             return true;
         }
         else
         {
             return false;
         }
     };
     self.notHaveProgs = function(username)
     {
         if( self.dataLoading== false &&( self.programs == null || self.programs.length ==0)) {
             return true;
         }
         else
         {
             return false;
         }
     }
     self.clickExeDet = function(exe_id){
         self.clickedmsg = false;
         self.chosenExe[exe_id] = true;
         self.exercises.forEach(function (element) {
             if(element.exe_id != exe_id)
             {
                 self.chosenExe[element.exe_id] = false;
             }
         });
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
             return true;
         }
         else {
             return false;
         }
     };
     self.progDet = function(prog_id)
     {
         self.dataLoading = true;
         self.clickedmsg = false;
         self.chosenProgram = prog_id;
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
             self.exercises.forEach(function (element) {
                 self.chosenExe[element.exe_id] = false;
                 if(element.media_path != null) {
                     //self.videosURL[element.exe_id] = "http://10.100.102.11:3000/api/mediaGet/"+element.media_path;
                     self.videosURL[element.exe_id] = "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + "/api/mediaGet/" + element.media_path;
                 }
             });
             self.dataLoading = false;

         }).catch(function (err) {
             alert(err.message);
             self.dataLoading = false;

         });
     }


     self.getMessages = function(patientUsername)
     {
         self.dataLoading = true;

         self.clickedDet = false;
         self.moreMsgInCor = {};
         self.correspondences = {};
         self.corsOrder= {};
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
                     let fixMsg = "";
                     let strArr = element.msg_content.split(",");
                     for (i = 0; i < strArr.length; i++) {
                         fixMsg += strArr[i] + "\n";
                     }
                     element.msg_content = fixMsg;
                 }
                 let cor_id= element.correspondence_id;
                 if(cor_id in self.corsOrder)
                 {
                     self.correspondences[self.corsOrder[cor_id]].push(element);
                 }
                 else {
                     let next = Object.keys(self.corsOrder).length
                     self.corsOrder[cor_id] = next;
                     self.correspondences[self.corsOrder[cor_id]] = [];
                     self.correspondences[self.corsOrder[cor_id]].push(element);
                     self.moreMsgInCor[cor_id]= false;
                     self.rep[cor_id]= false;
                 }


             });
             self.dataLoading = false;

         }).catch(function (err) {
             console.log(err);
             self.dataLoading = false;

         });
     }

     self.more = function(cor_id)
     {
         console.log("cor_id: " + cor_id);
         console.log(self.moreMsgInCor);

         self.moreMsgInCor[cor_id] = true;
         console.log(self.moreMsgInCor);

         for (index in self.corsOrder)
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
         self.repMsg = "";

         console.log("cor: "+cor);

         //create new message
         //check who is the other person and he will be the recipient
         for (index in self.corsOrder)
         {
             console.log("index: "+index);
             if(index != cor.correspondence_id)
             {
                 self.rep[index]  = false;
             }
         };
         self.rep[cor.correspondence_id] = true;
     };
     self.sendNewnewMsg = function()
     {
         if (self.newMsg == null) {
             alert("טקסט לא חוקי");
         }
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
             $route.reload();



         }).catch(function(err)
         {
             console.log(err);
             alert("שגיאה");
         })
     };

     self.sendRep = function (cor) {
         if (self.repMsg == null|| self.repMsg == "") {
             alert("טקסט לא חוקי");
         }
         else {
             let reqMsg = {
                 method: 'POST',
                 url: "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + '/api/sendMessage',

                 headers: {
                     'Content-Type': "application/json"
                 },
                 data: {
                     "isNew": false,
                     "cor_id": cor.correspondence_id,
                     "to": self.chosenPatMsgUsername,
                     "from": self.authService.userId,
                     "msgtitle": cor.title,
                     "date": Date.now(),
                     "content": self.repMsg
                 }
             };
             $http(reqMsg).then(function (ans) {
                 alert("ההודעה נשלחה");
                 self.repMsg = "";
                 $route.reload();


             }).catch(function (err) {
                 console.log(err);
                 alert("שגיאה");
             })
         }
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