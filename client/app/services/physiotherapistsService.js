/**
 * Created by NOA-PC on 1/14/2018.
 */
//service that stores the physiotherapist's username
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