/**
 * Created by NOA-PC on 12/23/2017.
 */

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