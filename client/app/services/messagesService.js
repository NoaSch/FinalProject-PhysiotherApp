/**
 * Created by NOA-PC on 5/5/2018.
 */
angular.module("myApp").service('messagesService', function() {
    var numNew = 0;
    return {
        getNumNew: function() {
            return numNew;
        },
        setNumNew: function(value) {
            numNew = value;
        },

    }
});