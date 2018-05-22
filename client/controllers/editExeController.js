/**
 * Created by NOA-PC on 12/21/2017.
 */
//handle with change of exercise details
angular.module("myApp")
 .controller('editExeController', ['regexService','AuthenticationService','Upload','$http', '$location', '$window','$scope', '$rootScope','programService','exerciseService','patientService','ipconfigService','$route', function (regexService,AuthenticationService,Upload,$http,$location, $window,$scope,$rootScope,programService,exerciseService,patientService,ipconfigService,$route   ) {
     let self = this;
     self.exerciseService = exerciseService;
         self.clickedAdd = false;
     self.videoClick = false;
     self.clickedCreate = true;
     self.finishLoad = false;
     self.addExeClicked = false;
     self.patientService = patientService;
     self.authService = AuthenticationService;
     self.defaultNum = 1;
     self.filterBy = "";
     self.regexService = regexService;

     let currExe =self.exerciseService.getExe();
     self.exeName = currExe.title;

     console.log(currExe);

     self.nSetsRange = [];
     for (var i = 1; i <= 10; i++) {
         self.nSetsRange.push(i);
     }


     self.nSets = currExe.num_sets;
     self.onTime = currExe.onTime;
     self.timeInWeek = currExe.time_in_week;
     self.timeInDay = currExe.time_in_day;
     self.nRepeats = currExe.num_repeats;
     self.setDuration = currExe.set_duration;
     self.setDurationUnits = currExe.set_duration_units;
     self.break = currExe.break_between_sets;
     self.breakUnits = currExe.break_between_sets_units;
     self.desc = currExe.description;
     self.curr_exe_title = currExe.exe_title;



     self.submit = function(valid){ //function to call on form submit

        if(!valid)
         {
             alert("נא הזן את כל השדות באופן חוקי");
         }

            else  if (self.nSets == null) {
                alert("בחר מספר סטים בתרגול");
            }
            else if (self.nRepeats == null && !self.onTime) {
                alert("בחר מספר חזרות בסט");

            }
            else if (self.setDuration == null && self.onTime) {
                alert("בחר משך זמן סט  ");

            }

            else {
                self.updateExe();
                self.submitExeClicked = true;

            }

     }


     self.updateExe = function()
     {
         let exeReq={
             method: 'POST',
             url: "http://"+ipconfigService.getIP()+":"+ipconfigService.getPort() +'/updateEXE', //webAPI exposed to upload the file
             data:{
                 "exe_id":self.exerciseService.getExe().exe_id,
                 "exe_title":self.exeName,
                 "onTime":self.onTime,
                 "timeInWeek":self.timeInWeek,
                 "timeInDay":self.timeInDay,
                 "nSets":self.nSets,
                 "nRepeats":self.nRepeats,
                 "setDuration":self.setDuration,
                 "setDurationUnits":self.setDurationUnits,
                 "break":self.break,
                 "breakUnits":self.breakUnits,
                 "description":self.desc,
             } //pass file as data, should be user ng-model
         };
         $http(exeReq).then(function(resp) { //upload function returns a promise
             if(resp.data.error_code === 0){ //validate success\\
                 $window.alert('התרגיל עודכן בהצלחה');
                 self.finishLoad = true;
                 $location.path('/patients');

             } else {
                 $window.alert('an error occured');
             }

         });
     };




 }]);