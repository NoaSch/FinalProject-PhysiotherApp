/**
 * Created by NOA-PC on 12/21/2017.
 */
//handle with adding new exercise to program
angular.module("myApp")
 .controller('addExeToProgController', ['regexService','AuthenticationService','Upload','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService','$route', function (regexService,AuthenticationService,Upload,$http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService,$route   ) {
     let self = this;
     self.programService = programService;
         self.clickedAdd = false;
     self.videoClick = false;
     self.clickedCreate = true;
     self.onTime = false;
     self.finishLoad = false;
     self.addExeClicked = false;
     self.patientService = patientService;
     self.authService = AuthenticationService;
     self.defaultNum = 1;
     self.desc ="";
     self.videoSource = "none";
     self.onlyPath = null;
     self.bankVideoChosen = false;
     self.filterBy = "";
     self.selectedTags =[];
     self.selectedTagsBnank =[];
     self.tagsNames = [];
     self.regexService = regexService;
     self.breakUnits = "שניות";
     self.setDurationUnits = "שניות";
     self.timeInWeek = "כל יום";
     self.ProgName = "הוספת תרגיל לתכנית";

        //generate the number of sets options
         self.nSetsRange = [];
     for (var i = 1; i <= 10; i++) {
         self.nSetsRange.push(i);
     }
     self.chosenVideo = {};
     self.videosURL = {};
     self.videosPath = {}
    //get the tags from the server
     let req = {
         method: 'GET',
         url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getTags'
     };
     $http(req).then(function (ans) {
         self.tags = ans.data;
         self.tags.forEach(function (element) {
             self.tagsNames.push(element.tag);
         })
     }).catch(function (err){alert(err);})
     //store the chosen video
     self.chooseVideo = function(title){
         self.chosenVideo[title] = true;
         self.chosenTitle = title;
         self.bankVideos.forEach(function (element) {
             if(element.title != title)
             {
                 self.chosenVideo[element.title] = false;
             }
         });
         self.bankVideoChosen = true;
     }

    //send the new exercise to the server
     self.submit = function(valid){ //function to call on form submit
        if(!valid)
         {
             alert("נא הזן את כל השדות באופן חוקי");
         }
         else {
            if (self.nSets == null) {
                alert("בחר מספר סטים בתרגול");
            }
            else if (self.nRepeats == null && !self.onTime) {
                alert("בחר מספר חזרות בסט");

            }
            else if (self.setDuration == null && self.onTime) {
                alert("בחר משך זמן סט  ");

            }
            else if (self.file) {
                if (self.file.type == "video/mp4" || self.file.type == "video/quicktime") {
                    if (self.videoSource == "new" && self.selectedTags.length == 0) {
                        alert("בחר תגית אחת לפחות");
                    }
                    else if (self.videoName == "" ||self.videoName == null)
                    {
                        alert("בחר שם לסרטון");
                    }
                    else {
                        console.log(self.file.type);
                        self.upload(self.file);
                        self.submitExeClicked = true;

                    }
                }
                else if (self.videoSource = "none") {
                    console.log("no file");
                    self.addExeWithoutFile();
                    self.submitExeClicked = true;
                }
                else {
                    alert("only videos, found: " + self.file.type);
                }
            }
            else {
                self.addExeWithoutFile();
                self.submitExeClicked = true;

            }

        }
     }
     //upload new exercise to the server
     self.upload = function (file) {
         self.finishLoad = false;
         let _onTime = 0;
         if(self.onTime === true)
         {
             _onTime = 1;
         }
         Upload.upload({
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/upload', //webAPI exposed to upload the file
             data:{
                 file:file,
                 //"prog_id":programService.getProgID(), //add new service orsomething
                 "prog_id":self.programService.getProgID(),
                 "exeTitle":self.exeTitle,
                 "onTime":_onTime,
                 "timeInWeek":self.timeInWeek,
                 "timeInDay":self.timeInDay,
                 "nSets":self.nSets,
                 "nRepeats":self.nRepeats,
                 "setDuration":self.setDuration,
                 "setDurationUnits":self.setDurationUnits,
                 "break":self.break,
                 "breakUnits":self.breakUnits,
                "description":self.desc,
                 "tags": self.selectedTags,
                 "videoName":self.videoName

             } //pass file as data, should be user ng-model
         }).then(function (resp) { //upload function returns a promise
             if(resp.data.error_code === 0){ //validate success\\

                 $window.alert('התרגיל נוסף בהצלחה');
                 self.file = null;
                 self.progress = "";
                 self.finishLoad = true;
                 self.onlyPath = null;
                 self.selectedTags = [];
                 self.videoSource == "none";
                 self.bankVideoChosen = false;
                 self.selectedTagsBnank = [];
                 self.bankVideos = {};
                 $location.path('/patients');

             }
             else if(resp.data.err_desc == "name exist")
             {
                 alert("סרטון עם השם הזה קיים במערכת, בחר שם אחר");
             }
             else {
                 $window.alert('an error occured: '+ resp.data.err_desc);
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
     //send new exercise to the server without new video
     self.addExeWithoutFile = function () {
         self.finishLoad = false;
         console.log(self.bankVideoChosen);

        if(self.videoSource == "bank") {
            self.onlyPath = self.videosPath[self.chosenTitle];
        }
             let _onTime = 0;
             if(self.onTime === true)
             {
                 _onTime = 1;
             }
             //self.cuurDate
             let exeReq={
                 method: 'POST',
                 url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/uploadNoVideo', //webAPI exposed to upload the file
                 data:{
                     //"prog_id":programService.getProgID(), //add new service orsomething
                     "prog_id":self.programService.getProgID(),
                     "exeTitle":self.exeTitle,
                     "onTime":_onTime,
                     "timeInWeek":self.timeInWeek,
                     "timeInDay":self.timeInDay,
                     "nSets":self.nSets,
                     "nRepeats":self.nRepeats,
                     "setDuration":self.setDuration,
                     "setDurationUnits":self.setDurationUnits,
                     "break":self.break,
                     "breakUnits":self.breakUnits,
                     "description":self.desc,
                     "path":self.onlyPath,
                     "bank" : self.bankVideoChosen


                 }
             };
             $http(exeReq).then(function(resp) { //upload function returns a promise
                 if(resp.data.error_code === 0){ //validate success\\


                     $window.alert('התרגיל נוסף בהצלחה');
                     self.finishLoad = true;
                     $location.path('/patients');

                 } else {
                     $window.alert('an error occured');
                 }

             });

     };

    //get all the videos with specific tags fro mthe server
     self.getBank = function() {
         if (self.selectedTagsBnank == null || self.selectedTagsBnank.length == 0) {
             alert("יש לבחור לפחות תגית אחת לחיפוש");
         }
         else {
             let bankReq = {
                 method: 'POST',
                 url: "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + '/api/getAllMediaByTags', //webAPI exposed to upload the file
                 data: {
                     "tags": self.selectedTagsBnank
                 }
             };
             $http(bankReq).then(function (ans) {
                 console.log(ans);
                 if (ans.status == 200) { //validate success\\
                     self.bankVideos = ans.data;
                     self.bankVideos.forEach(function (element) {
                         console.log(element);
                         self.chosenVideo[element.title] = false;
                         if (element.media_path != null) {
                             self.videosURL[element.title] = "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + "/api/mediaGet/" + element.media_path;
                             self.videosPath[element.title] = element.media_path;

                             self.finishLoad = true;
                         }
                     });
                 }
                 else {
                     $window.alert('an error occured');
                 }
             }).catch(function (err) {
                 alert("error:" + err);
             });
         }
     }
     ;

    self.showTag = function (tag)
    {
      if(tag == 'undefined') {

          return false;
      }
        else {
          return true;
      }
    };

     self.AddExe = function(){ //function to call on form submit
        self.clickedAdd = true;

     };


 }]);