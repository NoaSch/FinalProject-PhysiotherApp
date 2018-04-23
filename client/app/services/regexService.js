/**
 * Created by NOA-PC on 4/22/2018.
 */
angular.module("myApp").service('regexService', function() {
    var notInjection = "^((?!(;|=)).)*$";

    return {
        getNotInjection: function() {
            return notInjection;
        }


    }
});