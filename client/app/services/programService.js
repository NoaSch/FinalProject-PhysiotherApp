/**
 * Created by NOA-PC on 12/23/2017.
 */

angular.module("myApp").service('programService', function() {
     var progID = 0;
        return {
            getProgID: function() {
                return progID;
            },
            setProgID: function(value) {
                progID = value;
            },

        }
    });