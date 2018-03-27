/**
 * Created by NOA-PC on 12/21/2017.
 */

angular.module("myApp")
 .controller('messagesController', ['$route','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService','AuthenticationService', function ($route,$http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService,AuthenticationService   ) {
     let self = this;
     self.inbox  = {};
     self.moreMsgInCor = {};
     self.correspondences = {};
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

         ///get the correspondence and tieles
         self.messages.forEach(function(element)
         {
             let cor_id= element.correspondence_id;
             if(cor_id in self.correspondences)
            {
               self.correspondences[cor_id].push(element);
            }
             else {
                 self.correspondences[cor_id] = [];
                 self.correspondences[cor_id].push(element);
                 self.moreMsgInCor[cor_id]= false;
             }

         });
         console.log("cors");
         console.log(self.correspondences);
         console.log(Object.keys(self.correspondences).length)
         //console.log(self.moreMsgInCor);
       /*  let reqInbox = {
             method: 'POST',
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getInbox',
             headers: {
                 'Content-Type': "application/json"
             },
             data: {
                 "username": self.authService.userId
             }
         };
         $http(reqInbox).then(function (ans) {
             self.messages = ans.data;
             console.log(self.messages);

         }).catch(function (err) {
             console.log(err)
         });

*/
     }).catch(function (err) {
         console.log(err)
     });

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

     }


 }]);