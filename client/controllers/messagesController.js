/**
 * Created by NOA-PC on 12/21/2017.
 */
//handle with show user's messages window
angular.module("myApp")
 .controller('messagesController', ['messagesService','regexService','$route','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService','AuthenticationService', function (messagesService,regexService,$route,$http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService,AuthenticationService   ) {
     let self = this;
     //self.inbox  = {};
     self.moreMsgInCor = {};
     self.correspondences = {};
     self.rep = {};
     self.dataLoading = true;
     self.corsOrder = {};
     self.regexService = regexService;
     self.authService = AuthenticationService;
     self.messagesService = messagesService;
     function loadMessages() {
         let req = {
             method: 'POST',
             url: "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + '/api/getAllMessagesOfUser',

             headers: {
                 'Content-Type': "application/json"
             },
             data: {
                 "username": self.authService.userId
             }
         };
         $http(req).then(function (ans) {
             self.messages = ans.data;
             console.log(self.messages);
             ///get the correspondence and tieles
             self.messages.forEach(function (element) {
                 if (element.type == "feedback") {
                     console.log("feedback");
                     let fixMsg = "";
                     let strArr = element.msg_content.split(",");
                     for (i = 0; i < strArr.length; i++) {
                         fixMsg += strArr[i] + "\n";
                     }
                     element.msg_content = fixMsg;
                     console.log(element.msg_content);
                 }
                 let cor_id = element.correspondence_id;
                 if (cor_id in self.corsOrder) {
                     self.correspondences[self.corsOrder[cor_id]].push(element);
                 }
                 else {
                     let next = Object.keys(self.corsOrder).length
                     console.log("length: " + next);
                     self.corsOrder[cor_id] = next;
                     console.log("corid:" + cor_id + " , order: " + next);
                     self.correspondences[self.corsOrder[cor_id]] = [];
                     console.log("length: " + next);
                     self.correspondences[self.corsOrder[cor_id]].push(element);
                     //console.log(element);
                     self.moreMsgInCor[cor_id] = false;
                     self.rep[cor_id] = false;
                 }

             });
             self.dataLoading = false;
         }).then(function (ans2) {
             let req2 = {
                 method: 'POST',
                 url: "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + '/api/updateReadMessagePatient',

                 headers: {
                     'Content-Type': "application/json"
                 },
                 data: {
                     "username": self.authService.userId
                 }
             };
             $http(req2).then(function (ans) {
                 messagesService.setNumNew(0);
                 //updateReadMessagePatient
             }).catch(function (err) {
                 console.log(err)
             });
         }).catch(function (err) {
             console.log(err)
         });
     };

     loadMessages();

     self.isNewewClicked = false;

     self.sendNewMsgClick = function()
     {
         self.isNewewClicked =true;

     }
     //reload the page
     self.refresh = function() {
         console.log("reload");
         $route.reload();
     };
     //check if user's is patient
     self.isPatient = function()
     {
         if(AuthenticationService.isPhysio == true || AuthenticationService.isAdmin== true||AuthenticationService.userId== "guest"||AuthenticationService.userId =="אורח")
         {
             console.log("userid"+ AuthenticationService.userId);
             return false;
         }
         else {
             return true;
         }
     }
     //check if message is not first in the correspondence
     self.notFirst = function(msg,cor)
     {
         if(msg == cor[0]) {
             return false;
         }
         else {
             return true;
         }
     };
     //check if message has prvious messages
     self.more = function(cor_id)
     {
         self.moreMsgInCor[cor_id] = true;

         for (index in self.corsOrder)//check
         {
             if(index != cor_id)
             {
                 self.moreMsgInCor[index]  = false;
             }
         };

     };
     //handle reply
     self.reply = function(cor)
     {
         self.repMsg = "";
         for (index in self.corsOrder)//check
         {
             if(index != cor.correspondence_id)
             {
                 self.rep[index]  = false;
             }
         };
        self.rep[cor.correspondence_id] = true;
     };
     //send new message to the physiotherapist
     self.sendNewMsg = function() {

         if (self.msgTitle == null || self.newMsg == null ||self.msgTitle == "" ||self.newMsg =="" ) {
             alert("טקסט לא חוקי");
         }
         else {
             ///call /api/sendMessage
             let reqMsg = {
                 method: 'POST',
                 url: "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + '/api/sendMessage',

                 headers: {
                     'Content-Type': "application/json"
                 },
                 data: {
                     "isNew": true,
                     "to": self.authService.PhysioUsername,
                     "from": self.authService.userId,
                     "date": Date.now(),
                     "msgtitle": self.msgTitle,
                     "content": self.newMsg
                 }
             };
             $http(reqMsg).then(function (ans) {
                 alert("ההודעה נשלחה");
                 self.newMsg = "";
                 self.msgTitle = "";
                 $route.reload();


             }).catch(function (err) {
                 console.log(err);
                 alert("שגיאה");
             })
         }
     };

    //send reply for a message
     self.sendRep = function (cor) {
         if (self.repMsg == null ||self.repMsg == "") {
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
                     "to": self.authService.PhysioUsername,
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
                 alert("error:" + err.message);
             })
         }
     }

 }]);