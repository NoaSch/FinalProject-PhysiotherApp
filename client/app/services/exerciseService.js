/**
 * Created by NOA-PC on 12/23/2017.
 */

angular.module("myApp").service('exerciseService', function() {
     var exeID = 0;
     var exe = {};
        return {
            getExeID: function() {
                return exeID;
            },
            setEXEID: function(value) {
                exeID = value;
            },
            getExe: function() {
                return exe;
            },
            setEXE: function(value) {
                exe = value;
            },

        }
    });