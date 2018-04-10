/**
 * Created by NOA-PC on 12/21/2017.
 */

angular.module("myApp")
 .controller('messagesController', ['$route','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService','AuthenticationService', function ($route,$http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService,AuthenticationService   ) {
     let self = this;
     //self.inbox  = {};
     self.moreMsgInCor = {};
     self.correspondences = {};
     self.rep = {};
     self.dataLoading = true;
     self.corsOrder = {};
     self.authService = AuthenticationService;
     let req = {
         method: 'POST',
         url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getAllMessagesOfUser',

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
         //console.log("cors");
         //console.log(self.correspondences);
         //console.log(Object.keys(self.correspondences).length)
         self.dataLoading = false;
     }).catch(function(err) {
         console.log(err)
     });

     self.isNewewClicked = false;

     self.sendNewMsgClick = function()
     {
         self.isNewewClicked =true;

     }

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

     self.notFirst = function(msg,cor)
     {
         if(msg == cor[0]) {
             return false;
         }
         else {
             return true;
         }
     };
     self.more = function(cor_id)
     {
         console.log("cor_id: " + cor_id);
         console.log(self.moreMsgInCor);

         self.moreMsgInCor[cor_id] = true;
         console.log(self.moreMsgInCor);

         for (index in self.corsOrder)//check
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
     self.reply = function(cor)
     {
         console.log("cor: "+cor);
         //create new message
         //check who is the other person and he will be the recipient
        self.rep[cor.correspondence_id] = true;
     };
     self.sendNewMsg = function()
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
                 "to": self.authService.PhysioUsername,
                 "from": self.authService.userId,
                 "date":Date.now(),
                 "msgtitle":self.msgTitle,
                 "content":self.newMsg
             }
         };
         $http(reqMsg).then(function (ans) {
             alert("ההודעה נשלחה");
             self.newMsg = "";
             self.msgTitle = "";

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
                 "to": self.authService.PhysioUsername,
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