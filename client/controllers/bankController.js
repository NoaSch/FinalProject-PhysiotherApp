/**
 * Created by NOA-PC on 12/21/2017.
 */
//handle with adding videos to the bank
angular.module("myApp")
 .controller('bankController', ['regexService','$route','AuthenticationService','Upload','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService', function (regexService,$route,AuthenticationService,Upload,$http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService   ) {
     let self = this;
     self.clickedAdd = false;
     self.videoClick = false;
     self.clickedCreate = false;
     self.finishLoad = false;
     self.addExeClicked = false;
     self.authService = AuthenticationService;
     self.defaultNum = 1;
     self.desc ="";
     self.currTag ="";
     self.selectedTags = [];
     self.regexService = regexService;
     let req = {
         method: 'GET',
         url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getTags'
     };
     $http(req).then(function (ans) {
         self.tags = ans.data;
         console.log(self.tags);
     }).catch(function (err){alert(err);})


    //send the new video to the server
     self.submit = function(){ //function to call on form submit
        console.log("in submit");
         if(self.selectedTags.length == 0)
         {
             alert("בחר לפחות תגית אחת");
         }
         else if (self.title == "" ||self.title == null)
         {
             alert("בחר שם לסרטון");
         }
        else if(self.file) {
            if(self.file.type =="video/mp4" || self.file.type =="video/quicktime" ) {
                self.upload(self.file);
            }
            else {
                alert ("only videos, found: " + self.file.type);

            }
        }
        else
         {
             alert("בחר סרטון");

         }

         self.submitExeClicked = true;
     };

     //send the upload request to the server
     self.upload = function (file) {

         self.finishLoad = false;

         Upload.upload({
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/uploadToBank', //webAPI exposed to upload the file
             data:{
                 file:file,
                 "title":self.title,
                 "tags":self.selectedTags
             } //pass file as data, should be user ng-model
         }).then(function (resp) { //upload function returns a promise
             if(resp.data.error_code === 0){ //validate success\\
                 $window.alert('הסרטון נוסף בהצלחה');
                 self.title = "";
                 self.file = null;
                 self.progress = "";
                 self.finishLoad = true;
                 self.currTag ="";
                 self.selectedTags =[];

             }
             else if(resp.data.err_desc == "name exist")
             {
                 alert("סרטון עם השם הזה קיים במערכת, בחר שם אחר");
             }
             else {
                 $window.alert('an error occured '+resp.data.err_desc);
             }
         }, function (resp) { //catch error
             console.log('Error status: ' + resp.status);
             $window.alert('Error status: ' + resp.status);
         }, function (evt) {
             console.log(evt);
             var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
             console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
             console.log(self.finishLoad);
             self.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
         });

     };
     self.refresh = function() {
         $route.reload();
     };
        //send request for adding new tag to the bank
     self.addNewTag = function()
     {
         let req = {
             method: 'POST',
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/addTagToBank',
         headers: {
         'Content-Type': "application/json"
     },
         data: {
             "tag": self.currTag
         }
     };
     $http(req).then(function (ans) {
         if(ans.data.error_code === 1){ //validate success\\
             $window.alert('התגית כבר קיימת');
             }
             else if(ans.data.error_code === 0) {
             $window.alert('התגית נוספה בהצלחה');
             self.refresh();
         }
         else {
             alert("error");
         }
     }).catch(function(err){
         alert("error: " + err);
     })
     };

 }]);