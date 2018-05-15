/**
 * Created by NOA-PC on 12/23/2017.
 */
//service that store the current usrname for reseting the password
angular.module("myApp").service('resetPasswordService', function() {
     var username = '';
return {
    getID: function() {
        return username;
    },
    setID: function(value) {
        username = value;
    },

}
});