/**
 * Created by NOA-PC on 12/23/2017.
 */
//service that store the exercise details for a feedback
angular.module("myApp").service('patientFeedbackService', function() {
    var chosenExercise = null;
    var chosenExerciseTitle = null;
return {
    getExercise: function() {
        return chosenExercise;
    },
    setID: function(value) {
        chosenExercise = value;
    },
    getExerciseTitle: function() {
        return chosenExerciseTitle;
    },
    setTitle: function(value) {
        chosenExerciseTitle = value;
    }

}
});