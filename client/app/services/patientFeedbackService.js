/**
 * Created by NOA-PC on 12/23/2017.
 */

angular.module("myApp").service('patientFeedbackService', function() {
     //var patientUsername = 'test string value';
    var chosenExercise = null;
return {
    getExercise: function() {
        return chosenExercise;
    },
    setID: function(value) {
        chosenExercise = value;
    },

}
});