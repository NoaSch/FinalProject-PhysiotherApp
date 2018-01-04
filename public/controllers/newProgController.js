/**
 * Created by NOA-PC on 12/21/2017.
 */

angular.module("myApp")
 .controller('newProgController', ['AuthenticationService','Upload','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService', function (AuthenticationService,Upload,$http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService   ) {
     let self = this;
     self.clickedAdd = false;
     self.videoClick = false;
     self.clickedCreate = false;
     self.currProgID;
     self.addExeClicked = false;
     self.authService = AuthenticationService;
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
                 "patient": "u1",
                 "physio": authService.userId,
                 "date": date,
                 "title": self.ProgName
             }
         };
         //alert(self.ProgName);
         self.clickedCreate = true;
         $http(req).then(function (ans) {alert("new program inserted")})};



     self.submit = function(){ //function to call on form submit
         if (/*self.upload_form.file.$valid && */self.file) { //check if from is valid
            // $window.alert("time:  "+self.timeInWeek);

             self.upload(self.file); //call upload function
         }
         self.submitExeClicked = true;
         ///
         ///check if we want to do another func without video -
         ///
     }
     self.upload = function (file) {
         ////get the programID
         let req = {
             method: 'POST',
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/api/getEXEidByDateAndPat',
             // url: 'http://132.73.201.132:4000/api/getUserPrograms',
             headers: {
                 'Content-Type': "application/json"
             },
             data: {
                 "patUsername": "u1",
                 "createDate": self.currDate
             }
         };
         $http(req).then(function (ans) {
             console.log("desc:" + self.desc);
             alert("desc:" + self.desc);
         let currProgIDLocal = ans.data[0].prog_id;
         //self.cuurDate
         Upload.upload({
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/upload', //webAPI exposed to upload the file
             data:{
                 file:file,
                 //"prog_id":programService.getProgID(), //add new service orsomething
                 "prog_id":currProgIDLocal,
                 "exeTitle":self.exeTitle,
                 "onTime":self.onTime,
                 "timeInWeek":self.timeInWeek,
                 "nSets":self.nSets,
                 "nRepeats":self.nRepeats,
                 "setDuration":self.setDuration,
                 "break":self.break,
                "description":self.desc

             } //pass file as data, should be user ng-model
         }).then(function (resp) { //upload function returns a promise
             if(resp.data.error_code === 0){ //validate success\\

                 ////call insert to DB!!!
                 $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
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
             self.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
         });
         })
     };
     self.uploadWork = function (file) {
         Upload.upload({
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/upload', //webAPI exposed to upload the file
             data:{file:file} //pass file as data, should be user ng-model
         }).then(function (resp) { //upload function returns a promise
             if(resp.data.error_code === 0){ //validate success\\

                 ////call insert to DB!!!

                 $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
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
             self.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
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
         self.submitExeClicked = false;
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