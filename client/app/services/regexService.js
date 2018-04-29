/**
 * Created by NOA-PC on 4/22/2018.
 */
angular.module("myApp").service('regexService', function() {
    var notInjection = "^((?!(;|=|script)).)*$";
    var phone = "^[0-9]{8,10}$";
    var pass = "^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].)(?=.*[a-z]).{4,15}$";


    return {
        getNotInjection: function() {
            return notInjection;
        },
        getPhone: function() {
            return phone;
        },
        getPass: function() {
            return pass;
        }



    }
});