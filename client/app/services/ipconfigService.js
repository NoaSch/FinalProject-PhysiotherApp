/**
 * Created by NOA-PC on 12/23/2017.
 */
//service that stores the ip of the server
angular.module("myApp").service('ipconfigService', function() {
     //var ip = '192.168.1.15';
    //var ip = '192.168.1.154';
  //var ip = '192.168.43.106';
    //var ip = '10.100.102.13';
   var ip ='132.73.219.235';

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