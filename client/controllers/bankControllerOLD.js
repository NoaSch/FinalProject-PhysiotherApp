/**
 * Created by NOA-PC on 12/21/2017.
 */

angular.module("myApp")
 .controller('bankController', ['AuthenticationService','Upload','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService', function (AuthenticationService,Upload,$http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService   ) {
     let self = this;
     self.clickedAdd = false;
     self.videoClick = false;
     self.clickedCreate = false;
     self.finishLoad = false;
     self.addExeClicked = false;
     self.authService = AuthenticationService;
     self.defaultNum = 1;
     self.desc ="";
     self.tags =[];
     self.currTag ="";
     self.addTag = function()
     {
         self.tags.push(self.currTag);
         self.currTag ="";
         console.log(self.tags);
     }
     self.submit = function(){ //function to call on form submit
        console.log("in submit");
        if(self.file) {
            if(self.file.type =="video/mp4" || self.file.type =="video/quicktime" ) {
                self.upload(self.file);
            }
            else {
                alert ("only videos, found: " + self.file.type);

            }
        }

         self.submitExeClicked = true;

         ///
         ///check if we want to do another func without video -
         ///
     };
     self.upload = function (file) {
         self.finishLoad = false;
         //self.cuurDate
         Upload.upload({
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/uploadToBank', //webAPI exposed to upload the file
             data:{
                 file:file,
                 "title":self.title,
                 "tags":self.tags
             } //pass file as data, should be user ng-model
         }).then(function (resp) { //upload function returns a promise
             if(resp.data.error_code === 0){ //validate success\\
                 $window.alert('הסרטון נוסף בהצלחה');
                 self.title = "";
                 self.file = null;
                 self.progress = "";
                 self.finishLoad = true;
                 self.tags =[];
                 self.currTag ="";

             } else {
                 $window.alert('an error occured');
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
             /*if(progressPercentage == 100)
             {
                 self.finishLoad = true;
             }*/
         });

     };




 }]);