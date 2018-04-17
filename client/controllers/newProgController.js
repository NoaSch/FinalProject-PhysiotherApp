/**
 * Created by NOA-PC on 12/21/2017.
 */

angular.module("myApp")
 .controller('newProgController', ['AuthenticationService','Upload','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService','$route', function (AuthenticationService,Upload,$http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService,$route   ) {
     let self = this;
     self.clickedAdd = false;
     self.videoClick = false;
     self.clickedCreate = false;
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


     self.nSetsRange = [];
     for (var i = 1; i <= 10; i++) {
         self.nSetsRange.push(i);
     }

     self.chosenVideo = {};
     self.videosURL = {};
     self.videosPath = {}
     //load bank details
     /*let reqBank = {
         method: 'POST',
         url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getBank',
         headers: {
             'Content-Type': "application/json"
         },

     };
     $http(reqBank).then(function (ans) {
         self.bankVideos = ans.data;
         self.bankVideos.forEach(function (element) {
             console.log(element);
             self.chosenVideo[element.title] = false;
             if(element.media_path != null) {
                 self.videosURL[element.title] = "http://" + ipconfigService.getIP() + ":" + ipconfigService.getPort() + "/api/mediaGet/" + element.media_path;
                 self.videosPath[element.title] = element.media_path;
             }
             console.log(self.videosPath[element.title]);
         });

     }).catch(function (err) {
         console.log(err)
     });*/
     let req = {
         method: 'GET',
         url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getTags'
     };
     $http(req).then(function (ans) {
         self.tags = ans.data;
         console.log(self.tags);
     }).catch(function (err){alert(err);})

     self. chooseVideo = function(title){
         self.chosenVideo[title] = true;
         self.chosenTitle = title;
         self.bankVideos.forEach(function (element) {
             if(element.title != title)
             {
                 self.chosenVideo[element.title] = false;
             }
         });
         self.bankVideoChosen = true;
console.log("chosen" + self.bankVideoChosen);
     }

    /* $scope.rememberMe = true;
     $scope.userPhoto;
     $scope.email = 'heyyy@example.com';
     $scope.name = 'gsrfg   ';*/

     /////new

     self. createProg = function(){ //function to call on form submit
        // alert(self.ProgName);\
         let date = new Date();
         self.currDate = date;
         let req = {
             method: 'POST',
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/createPrgram',
             // url: 'http://132.73.201.132:4000/api/getUserPrograms',
             headers: {
                 'Content-Type': "application/json"
             },
             data: {
                 "patient": self.patientService.getID(),
                 "physio": self.authService.userId,
                 "date": date,
                 "title": self.ProgName
             }
         };
         //alert(self.ProgName);
         self.clickedCreate = true;
         $http(req).then(function (ans)
         {
             //alert("new program inserted")
         })};



     self.submit = function(){ //function to call on form submit
        /* if (/*self.upload_form.file.$valid && self.file) { //check if from is valid and exist
            // $window.alert("time:  "+self.timeInWeek);
             self.upload(self.file) //call upload function
         /*}*/
        if(self.file) {
            if(self.file.type =="video/mp4" || self.file.type =="video/quicktime" ) {
                if(self.videoSource == "new"&& self.selectedTags.length == 0)
                {
                    alert("בחר תגית אחת לפחות");
                }
                else {
                    console.log(self.file.type);
                    self.upload(self.file);
                    self.submitExeClicked = true;

                }
            }
            else if(self.videoSource = "none")
            {
                console.log("no file");
                self.addExeWithoutFile();
                self.submitExeClicked = true;
            }
            else {
                alert ("only videos, found: " + self.file.type);
            }
        }
        else {
            self.addExeWithoutFile();
            self.submitExeClicked = true;

        }
         ///
         ///check if we want to do another func without video -
         ///
     }
     self.upload = function (file) {
         self.finishLoad = false;
         ////get the programID
         let req = {
             method: 'POST',
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getEXEidByDateAndPat',
             // url: 'http://132.73.201.132:4000/api/getUserPrograms',
             headers: {
                 'Content-Type': "application/json"
             },
             data: {
                 "patUsername": self.patientService.getID(),
                 "createDate": self.currDate
             }
         };
         $http(req).then(function (ans) {
            /* console.log("desc:" + self.desc);*/
             /*alert("desc:" + self.desc);*/
         let currProgIDLocal = ans.data[0].prog_id;
             let _onTime = 0;
             if(self.onTime === true)
             {
                 _onTime = 1;
             }
         //self.cuurDate
         Upload.upload({
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/upload', //webAPI exposed to upload the file
             data:{
                 file:file,
                 //"prog_id":programService.getProgID(), //add new service orsomething
                 "prog_id":currProgIDLocal,
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

                 ////call insert to DB!!!
                /* $window.alert('Success ' + resp.config.data.file.name + 'uploaded. ');*/
                 //self.finishLoad = true;
                 $window.alert('התרגיל נוסף בהצלחה');
                 self.file = null;
                 self.progress = "";
                 self.finishLoad = true;
                 self.onlyPath = null;
                 self.selectedTags = [];


             } else {
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
             /*if(progressPercentage == 100)
             {
                 self.finishLoad = true;
             }*/
         });
         })
     };

     self.addExeWithoutFile = function () {
         self.finishLoad = false;
         console.log(self.bankVideoChosen);
        /* self.chosenVideo.forEach(function (element) {
             console.log(element);
             if(element == true)
             {
                 onlyPath = self.videosURL[element.title];
             }
             })*/
        if(self.videoSource == "bank") {
            self.onlyPath = self.videosPath[self.chosenTitle];
        }
         ////get the programID
         let req = {
             method: 'POST',
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getEXEidByDateAndPat',
             // url: 'http://132.73.201.132:4000/api/getUserPrograms',
             headers: {
                 'Content-Type': "application/json"
             },
             data: {
                 "patUsername": self.patientService.getID(),
                 "createDate": self.currDate
             }
         };
         $http(req).then(function (ans) {
             /* console.log("desc:" + self.desc);*/
             /*alert("desc:" + self.desc);*/
             let currProgIDLocal = ans.data[0].prog_id;
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
                     "prog_id":currProgIDLocal,
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


                 } //pass file as data, should be user ng-model
             };
             $http(exeReq).then(function(resp) { //upload function returns a promise
                 if(resp.data.error_code === 0){ //validate success\\

                     ////call insert to DB!!!
                     /* $window.alert('Success ' + resp.config.data.file.name + 'uploaded. ');*/

                     $window.alert('התרגיל נוסף בהצלחה');
                     self.finishLoad = true;
                 } else {
                     $window.alert('an error occured');
                 }

             });
         })
     };
    self.showTag = function (tag)
    {
      if(tag == 'undefined') {

          return false;
      }
        else {
          return true;
      }
    };
     self.finish = function()
     {
         alert("תכנית האימון נוצרה בהצלחה");
     }

     self.uploadWork = function (file) {
         Upload.upload({
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/upload', //webAPI exposed to upload the file
             data:{file:file} //pass file as data, should be user ng-model
         }).then(function (resp) { //upload function returns a promise
             if(resp.data.error_code === 0){ //validate success\\

                 ////call insert to DB!!!
                 $window.alert('התרגיל נוסף בהצלחה');
                 self.finishLoad = true;


                 /* $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');*/
             } else {
                 $window.alert('an error occured');
             }
         }, function (resp) { //catch error
             console.log('Error status: ' + resp.status);
             $window.alert('Error status: ' + resp.status);
         }, function (evt) {
             console.log(evt);
             if(typeof evt.config.data.file != undefined) {
                 var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                 console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                 self.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
             }
         });
     };

     $scope.login = function() {
         alert( $scope.email);
         self.clicked = true;

     };

     self.AddExe = function(){ //function to call on form submit
        self.clickedAdd = true;

     };
     self.AddMoreExe = function(){ //function to call on form submit
        /* self.submitExeClicked = false;
         self.exeTitle = "";
         self.timeInWeek = self.defaultNum;
         self.nSets = self.defaultNum;
         self.nRepeats = self.defaultNum;
         self.setDuration = self.defaultNum;
         self.break = self.defaultNum;
         self.desc = "";*/
         self.submitExeClicked = false;
         self.exeTitle = null;
         self.timeInWeek = null;
         self.timeInDay = null;

         self.nSets = null;
         self.nRepeats = null;
         self.setDuration = null;
         self.setDurationUnits = null;

         self.break = null;
         self.breakUnits=null;
         self.bankVideoChosen = false;
         self.videoSource="none";
         self.chosenTitle = null;
         self.onlyPath = null;

         self.bankVideos.forEach(function (element) {
             self.chosenVideo[element.title] = false;
         });


         self.desc = "";
     };

   /*  $scope.uploadVideo = function () {
         alert("file: " + $scope.userPhoto + "name: " + $scope.name);

         $http({
             method: 'POST',
             url: 'http://10.100.102.13:4000/api/photo',
             headers: {
                 'Content-Type': 'multipart/form-data'
             },
             data: {
                 file: $scope.userPhoto
             },
             transformRequest: function (data, headersGetter) {
                 var formData = new FormData();
                 angular.forEach(data, function (value, key) {
                     formData.append(key, value);
                 });

                 var headers = headersGetter();
                 delete headers['Content-Type'];

                 return formData;
             }
         });

 };

     $scope.uploadFile = function(){

         var file = $scope.myFile;
         alert("files: " + file);
         var uploadUrl = "http://10.100.102.13:4000/api/photo";
         var fd = new FormData();
         fd.append('file', file);

         $http.post(uploadUrl,fd, {
             transformRequest: angular.identity,
             headers: {'Content-Type': undefined}
         });
            /* .success(function(){
                 console.log("success!!");
             })
             .error(function(){
                 console.log("error!!");
             });
     };*/
     self.testFunc = function(){
         alert("testtttt");
     };
     $scope.testFunc = function(){
         alert("testtttt");
     };
     $scope.addExe = function() {
         alert("adding Exe");
         self.videoClick = true;
         self.clicked = false;

     };
     $scope.addExe2 = function() {
         alert( "adding Exe");
         var req = {
      method: 'POST',
      url: 'http://10.100.102.13:4000/api/photo',
      headers: {
      'Content-Type': "multipart/form-data"
      },
             "file": $scope.userPhoto
         }
         $http(req).then(function (ans) {
             var res = ans.data;
     })};


    /*<form id="uploadForm"
     enctype="multipart/form-data"
     action="http://192.168.1.15:4001/api/photo"
     method="post">
         <input type="file" name="userPhoto" />
         <input type="submit" value="העלה תמונה" name="submit">
         <span id = "status"></span>
         </form>-->*/
  /*  let self = this;
     let req = {
         method: 'POST',
         //url: 'http://132.73.201.132:3000/api/getUserPrograms',
         //url: 'http://10.100.102.11:3000/api/getUserPrograms',
         url: ipAndProt+'/api/getPhysioPatients',

         headers: {
             'Content-Type': "application/json"
         },
         data: {
             "physio": "p1"
         }
     };
     $http(req).then(function (ans) {
         self.patients = ans.data;
        // self.programs = [];
        /* for (i = 0; i < progs.length; i++) {
             self.programs.push(progs.prog_id);
         }*/
    /*     console.log(self.patients);

         //console.log(self.videsPathes);
     }).catch(function (err) {
         console.log(err)
     });

        self.clickUser = function(patient){
            self.chosenPatient = patient;
            console.log("chosen patient: " +  self.chosenPatient );
        };
     self.createProgram = function(patient){
         patientService.setID(patient);
         console.log("chosen patient: " +  patientService.getID());
     }*/
 }]);