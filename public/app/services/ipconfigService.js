/**
 * Created by NOA-PC on 12/23/2017.
 */

angular.module("myApp").service('ipconfigService', function() {
     //var ip = '192.168.1.15';
    var ip = '10.100.102.10';
     var port =  4000;
        return {
            getIP: function() {
                return ip;
            },
            setIP: function(value) {
                ip = value;
            },
            getPort: function() {
                return port;
            },
            setProt: function(value) {
                port = value;
            }
        }
    });