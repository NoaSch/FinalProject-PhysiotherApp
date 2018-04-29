/**
 * Created by NOA-PC on 12/21/2017.
 */

angular.module("myApp")
 .controller('changeDetailsController', ['regexService','$route','AuthenticationService','Upload','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService', function (regexService,$route,AuthenticationService,Upload,$http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService   ) {
     let self = this;
     self.authService = AuthenticationService;
     self.regexService = regexService;
    self.dataLoading = true;


     let req = {
         method: 'POST',
         url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getPatientDetails',

         headers: {
             'Content-Type': "application/json"
         },
         data: {
             "username": self.authService.userId
         }
     };
     $http(req).then(function (ans) {
                self.firstName = ans.data[0].first_name;
                self.lastName = ans.data[0].last_name;
                self.phone = ans.data[0].phone;
                self.mail = ans.data[0].mail;
                self.oldPicURL = ans.data[0].pic_url;
                if(ans.data[0].pic_url != null) {
                    self.pic = "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + "/api/getPic/" + self.oldPicURL;
                }
                else {
                    self.pic == null;
                }
         self.dataLoading = false;

     }).catch(function (err) {
         console.log(err)
     });
     //get the user's details like in patient


     self.submit = function () {
         self.dataLoading = true;//function to call on form submit
         console.log("in submit");
         /*if (self.file &&  self.file.type == "image/png") {
             alert("נא בחר קובץ JPEG או PNG");
             }
             else {

             self.upload(self.file);
             }*/
         if (self.file) {
             if (self.file.type == "image/jpeg" || self.file.type == "image/png") {
                 self.upload(self.file);
             }
             else {
                 alert("שגיאה: ניתן להעלות תמונות בפורמט jpg,jpeg,png בלבד");
                 self.dataLoading = false;

             }
         }
         else {
             self.upload(null);
         }


     };
     self.upload = function (file) {

         self.finishLoad = false;
         //self.cuurDate
         Upload.upload({
             url: "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + '/api/updateUserDetails', //webAPI exposed to upload the file
             data: {
                 file: file,
                 "username": self.authService.userId,
                 "firstName": self.firstName,
                 "lastName": self.lastName,
                 "mail": self.mail,
                 "phone": self.phone,
             } //pass file as data, should be user ng-model
         }).then(function (response) {
             if (response.data.hasOwnProperty('err')) {
                 self.isError = true;
                 self.error = response.data.err;
                 self.dataLoading = false;

             }//upload function returns a promise
             else { //validate success\\
                 self.file = null;
                 self.progress = "";
                 self.finishLoad = true;
                 alert("ההעלאה הצליחה");
                 self.dataLoading = false;
                 $route.reload();

             }
         }, function (resp) { //catch error
             $window.alert('Error status: ' + resp.status);
         }, function (evt) {
             var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
             self.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
             /*if(progressPercentage == 100)
              {
              self.finishLoad = true;
              }*/
         });
     };
         self.refresh = function () {
             $route.reload();
         };


 }]);