/**
 * Created by NOA-PC on 12/23/2017.
 */

angular.module("myApp").service('exerciseService', function() {
     var exeID = 'test string value';
        return {
            getExeID: function() {
                return exeID;
            },
            setEXEID: function(value) {
                exeID = value;
            },

        }
    });