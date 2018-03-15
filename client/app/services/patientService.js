/**
 * Created by NOA-PC on 12/23/2017.
 */

angular.module("myApp").service('patientService', function() {
     var patientUsername = 'test string value';
return {
    getID: function() {
        return patientUsername;
    },
    setID: function(value) {
        patientUsername = value;
    },

}
});